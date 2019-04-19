import {
    UI_START_LOADING_ACTION,
    UI_STOP_LOADING_ACTION
} from "../actions/actionTypes";

const initialState = {
    isLoading: true,
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
        default:
            return state;
    }
};

export default reducer;