import {
    UI_START_LOADING_ACTION,
    UI_STOP_LOADING_ACTION
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