import {applyMiddleware, combineReducers, createStore, compose} from "redux";
import thunk from "redux-thunk";

import uiReducer from './reducers/uiReducer';

const rootReducer = combineReducers({
    ui: uiReducer,
});

let composeEnhancers = compose;

const addLoggingToDispatch = store => {
    const rawDispatch = store.dispatch;

    if (!console.group) {
        return rawDispatch;
    }

    return action => {
        console.group("Return action from configure store: ", action.type);
        // console.log("%c prev state", "color: gray", store.getState());
        // console.log("%c action", "color: blue", action);
        const returnValue = rawDispatch(action);
        // console.log("%c next state", "color: green", store.getState());
        console.groupEnd(action.type);

        return returnValue;
    };
};

export default function configureStore() {
    const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));
    store.dispatch = addLoggingToDispatch(store);
    return store;
}