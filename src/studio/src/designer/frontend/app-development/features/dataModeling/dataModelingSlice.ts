/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { Action, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IDataModelAction {
  payload: IDataModelActionPayload;
  type: string;
}
export interface IDataModelActionPayload {
  schema: any;
}

export interface IDataModelErrorActionPayload extends Action {
  error: Error;
}

export interface ISetDataModelFilePathActionPayload extends Action {
  filePath: string;
}

export interface IDataModelingState {
  schema: any;
  modelName: string;
  error: Error;
  saving: boolean;
}

export interface IDeleteDataModelRejected {
  error: any;
}

const initialState: IDataModelingState = {
  schema: {},
  modelName: undefined,
  error: null,
  saving: false,
};

const dataModelingSlice = createSlice({
  name: 'dataModeling',
  initialState,
  reducers: {
    fetchDataModel(state, action) {},
    fetchDataModelFulfilled(state, action) {
      const { schema } = action.payload;
      state.schema = schema;
      state.error = null;
    },
    fetchDataModelRejected(state, action) {
      const { error } = action.payload;
      state.error = error;
    },
    saveDataModel(state, action) {
      const { schema } = action.payload;
      state.schema = schema;
      state.saving = true;
    },
    saveDataModelFulfilled(state, action) {
      state.saving = false;
    },
    saveDataModelRejected(state, action) {
      const { error } = action.payload;
      state.error = error;
      state.saving = false;
    },
    setDataModelName(state, action) {
      const { modelName } = action.payload;
      state.modelName = modelName;
    },
    createNewDataModel(state, action) {
      const { modelName } = action.payload;
      state.modelName = modelName;
      state.error = null;
      state.schema = {};
    },
    deleteDataModel(state) {
      state.saving = true;
    },
    deleteDataModelFulfilled(state) {
      state.saving = false;
      state.schema = {};
      state.modelName = '';
    },
    deleteDataModelRejected(state, action: PayloadAction<IDeleteDataModelRejected>) {
      state.error = action.payload.error;
      state.saving = false;
    },
  },
});

export const {
  fetchDataModel,
  fetchDataModelFulfilled,
  fetchDataModelRejected,
  saveDataModel,
  saveDataModelFulfilled,
  saveDataModelRejected,
  setDataModelName,
  createNewDataModel,
  deleteDataModel,
  deleteDataModelFulfilled,
  deleteDataModelRejected,
} = dataModelingSlice.actions;

export default dataModelingSlice.reducer;
