import {
    UI_START_LOADING_ACTION,
    UI_STOP_LOADING_ACTION,
    UI_START_VALIDATING_ACTION,
    UI_STOP_VALIDATING_ACTION
} from "./actionTypes";

export const uiStartLoading = () => {
    return {
        type: UI_START_LOADING_ACTION
    };
};


export const uiStopLoading = () => {
    return {
        type: UI_STOP_LOADING_ACTION
    };
};

export const uiStartValidating = () => {
    return {
        type: UI_START_VALIDATING_ACTION
    };
};

export const uiStopValidating = () => {
    return {
        type: UI_STOP_VALIDATING_ACTION
    };
};