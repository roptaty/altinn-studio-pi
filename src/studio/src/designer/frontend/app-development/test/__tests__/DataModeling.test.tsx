/* tslint:disable:jsx-wrap-multiline */
import 'jest';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import DataModelingContainer from '../../features/dataModeling/containers/DataModelingContainer';

describe('DataModeling', () => {
  const language = { administration: {} };
  const initialState = {
    applicationMetadataState: {
      applicationMetadata: {
        dataTypes: [
          {
            id: 'ref-data-as-pdf',
            allowedContentTypes: [
              'application/pdf',
            ],
            maxCount: 0,
            minCount: 0,
          },
          {
            id: 'some-existing-model',
            appLogic: {},
          },
        ],
      },
    },
    dataModeling: {
      schema: {},
      modelName: 'test',
      saving: false,
    },
  };
  let store: any;
  const dispatchMock = () => Promise.resolve({});
  beforeEach(() => {
    store = configureStore()(initialState);
    store.dispatch = jest.fn(dispatchMock);
  });

  it('Should match snapshot', () => {
    let wrapper: any = null;
    act(() => {
      wrapper = mount(
        <Provider store={store}>
          <DataModelingContainer language={language} />
        </Provider>,
      );
    });
    expect(wrapper.getDOMNode()).toMatchSnapshot();
  });

  it('fetches model on mount', () => {
    let wrapper: any = null;
    act(() => {
      wrapper = mount(
        <Provider store={store}>
          <DataModelingContainer language={language} />
        </Provider>,
        { context: { store } },
      );
    });
    expect(wrapper).not.toBeNull();
    wrapper.mount();

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'dataModeling/setDataModelName',
      payload: {
        modelName: 'some-existing-model',
      },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'dataModeling/fetchDataModel',
      payload: {},
    });
  });

  it('dispatches correctly when clicking new', () => {
    let wrapper: any = null;
    act(() => {
      wrapper = mount(
        <Provider store={store}>
          <DataModelingContainer language={language} />
        </Provider>,
        { context: { store } },
      );
    });
    expect(wrapper).not.toBeNull();

    expect(wrapper.find('input').length).toBe(1);
    expect(wrapper.find('button').length).toBe(3);
    wrapper.find('#new-button').at(0).simulate('click');
    expect(wrapper.find('input').length).toBe(2);

    wrapper.find('input').last().simulate('change', { target: { value: 'test' } });
    expect(wrapper.find('button').length).toBe(4);
    wrapper.find('#newModelInput').find('button').simulate('click');

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'dataModeling/createNewDataModel',
      payload: {
        modelName: 'test',
      },
    });
  });

  it('dispatches correctly when clicking delete', () => {
    let wrapper: any = null;
    act(() => {
      wrapper = mount(
        <Provider store={store}>
          <DataModelingContainer language={language} />
        </Provider>,
        { context: { store } },
      );
    });
    expect(wrapper).not.toBeNull();

    wrapper.find('#delete-button').at(0).simulate('click');
    wrapper.find('#confirm-delete-button').at(0).simulate('click');

    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'dataModeling/deleteDataModel',
      payload: undefined,
    });
  });

  it('does not dispatch create when name is missing', () => {
    let wrapper: any = null;
    act(() => {
      wrapper = mount(
        <Provider store={store}>
          <DataModelingContainer language={language} />
        </Provider>,
        { context: { store } },
      );
    });
    expect(wrapper).not.toBeNull();
    wrapper.find('#new-button').at(0).simulate('click');

    wrapper.find('#newModelInput').find('button').simulate('click');
    expect(store.dispatch).not.toHaveBeenCalledWith({
      type: 'dataModeling/createNewDataModel',
    });
  });
});
