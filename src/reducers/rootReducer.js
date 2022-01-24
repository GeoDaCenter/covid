import { combineReducers } from "redux";
import data from "../reducers/dataReducer";
import params from "../reducers/paramsReducer";
import ui from "../reducers/uiReducer";

export default combineReducers({
    data,
    params,
    ui,
})