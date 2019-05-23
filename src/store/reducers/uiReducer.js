import {
    UI_START_LOADING_ACTION,
    UI_STOP_LOADING_ACTION,
    UI_START_VALIDATING_ACTION,
    UI_STOP_VALIDATING_ACTION
} from "../actions/actionTypes";

const initialState = {
    isLoading: true,
    isValidating: true,
};


const reducer = (state = initialState, action) => {
    switch (action.type) {
        case UI_START_LOADING_ACTION:
            return {
                ...state,
                isLoading: true
            };
        case UI_STOP_LOADING_ACTION:
            return {
                ...state,
                isLoading: false
            };
        case UI_START_VALIDATING_ACTION:
            return {
                ...state,
                isValidating: true
            };
        case UI_STOP_VALIDATING_ACTION:
            return {
                ...state,
                isValidating: false
            };
        default:
            return state;
    }
};

export default reducer;