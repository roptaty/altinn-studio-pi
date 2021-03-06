import { SagaIterator } from 'redux-saga';
import { call, all, put, take, select, takeLatest } from 'redux-saga/effects';
import { IInstance } from 'altinn-shared/types';
import { IApplicationMetadata } from 'src/shared/resources/applicationMetadata';
import { getLayoutSettingsUrl, getLayoutSetsUrl, getLayoutsUrl } from 'src/utils/urlHelper';
import { get } from '../../../../utils/networking';
import { FormLayoutActions as Actions } from '../formLayoutSlice';
import * as FormDataActionTypes from '../../data/formDataActionTypes';
import QueueActions from '../../../../shared/resources/queue/queueActions';
import { getRepeatingGroups } from '../../../../utils/formLayout';
import { ILayoutSettings, IRuntimeState, ILayoutSets } from '../../../../types';
import { IFormDataState } from '../../data/formDataReducer';
import { ILayouts } from '../index';
import { getLayoutsetForDataElement } from '../../../../utils/layout';
import { getDataTaskDataTypeId } from '../../../../utils/appMetadata';

const formDataSelector = (state: IRuntimeState) => state.formData;
const layoutSetsSelector = (state: IRuntimeState) => state.formLayout.layoutsets;
const instanceSelector = (state: IRuntimeState) => state.instanceData.instance;
const applicationMetadataSelector = (state: IRuntimeState) => state.applicationMetadata.applicationMetadata;

function* fetchLayoutSaga(): SagaIterator {
  try {
    const layoutSets: ILayoutSets = yield select(layoutSetsSelector);
    const instance: IInstance = yield select(instanceSelector);
    const formDataState: IFormDataState = yield select(formDataSelector);
    const aplicationMetadataState: IApplicationMetadata = yield select(applicationMetadataSelector);
    const dataType: string = getDataTaskDataTypeId(instance.process.currentTask.elementId,
      aplicationMetadataState.dataTypes);

    let layoutSetId: string = null;
    if (layoutSets != null) {
      layoutSetId = getLayoutsetForDataElement(instance, dataType, layoutSets);
    }
    const layoutResponse: any = yield call(get, getLayoutsUrl(layoutSetId));
    const layouts: ILayouts = {};
    const navigationConfig: any = {};
    let autoSave: boolean;
    let firstLayoutKey: string;
    let repeatingGroups = {};
    if (layoutResponse.data) {
      layouts.FormLayout = layoutResponse.data.layout;
      firstLayoutKey = 'FormLayout';
      autoSave = layoutResponse.data.autoSave;
      repeatingGroups = getRepeatingGroups(layouts[firstLayoutKey],
        formDataState.formData);
    } else {
      const orderedLayoutKeys = Object.keys(layoutResponse).sort();

      // use instance id as cache key for current page
      const currentViewCacheKey = instance.id;
      yield put(Actions.setCurrentViewCacheKey({ key: currentViewCacheKey }));
      firstLayoutKey = localStorage.getItem(currentViewCacheKey) || orderedLayoutKeys[0];

      orderedLayoutKeys.forEach((key) => {
        layouts[key] = layoutResponse[key].data.layout;
        navigationConfig[key] = layoutResponse[key].data.navigation;
        autoSave = layoutResponse[key].data.autoSave;
        repeatingGroups = {
          ...repeatingGroups,
          ...getRepeatingGroups(layouts[key], formDataState.formData),
        };
      });
    }

    yield put(Actions.fetchLayoutFulfilled({ layouts, navigationConfig }));
    yield put(Actions.updateAutoSave({ autoSave }));
    yield put(Actions.updateRepeatingGroupsFulfilled({ repeatingGroups }));
    yield put(Actions.updateCurrentView({ newView: firstLayoutKey, skipPageCaching: true }));
  } catch (error) {
    yield put(Actions.fetchLayoutRejected({ error }));
    yield call(QueueActions.dataTaskQueueError, error);
  }
}

export function* watchFetchFormLayoutSaga(): SagaIterator {
  while (true) {
    yield all([
      take(Actions.fetchLayout),
      take(FormDataActionTypes.FETCH_FORM_DATA_INITIAL),
      take(FormDataActionTypes.FETCH_FORM_DATA_FULFILLED),
      take(Actions.fetchLayoutSetsFulfilled),
    ]);
    yield call(fetchLayoutSaga);
  }
}

export function* fetchLayoutSettingsSaga(): SagaIterator {
  try {
    const layoutSets: ILayoutSets = yield select(layoutSetsSelector);
    const instance: IInstance = yield select(instanceSelector);
    const aplicationMetadataState: IApplicationMetadata = yield select(applicationMetadataSelector);
    const dataType: string = getDataTaskDataTypeId(instance.process.currentTask.elementId,
      aplicationMetadataState.dataTypes);
    let layoutSetId: string = null;
    if (layoutSets != null) {
      layoutSetId = getLayoutsetForDataElement(instance, dataType, layoutSets);
    }
    const settings: ILayoutSettings = yield call(get, getLayoutSettingsUrl(layoutSetId));
    yield put(Actions.fetchLayoutSettingsFulfilled({ settings }));
  } catch (error) {
    if (error?.response?.status === 404) {
      // We accept that the app does not have a settings.json as this is not default
      yield put(Actions.fetchLayoutSettingsFulfilled({ settings: null }));
    } else {
      yield put(Actions.fetchLayoutSettingsRejected({ error }));
    }
  }
}

export function* watchFetchFormLayoutSettingsSaga(): SagaIterator {
  while (true) {
    yield all([
      take(Actions.fetchLayoutSettings),
      take(Actions.fetchLayoutFulfilled),
    ]);
    yield call(fetchLayoutSettingsSaga);
  }
}

export function* fetchLayoutSetsSaga(): SagaIterator {
  try {
    const layoutSets: ILayoutSets = yield call(get, getLayoutSetsUrl());
    yield put(Actions.fetchLayoutSetsFulfilled({ layoutSets }));
  } catch (error) {
    if (error?.response?.status === 404) {
      // We accept that the app does not have a layout sets as this is not default
      yield put(Actions.fetchLayoutSetsFulfilled({ layoutSets: null }));
    } else {
      yield put(Actions.fetchLayoutSetsRejected({ error }));
    }
  }
}

export function* watchFetchFormLayoutSetsSaga(): SagaIterator {
  yield takeLatest(Actions.fetchLayoutSets, fetchLayoutSetsSaga);
}
