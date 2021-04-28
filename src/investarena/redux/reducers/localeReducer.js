import { SET_LOCALES_SUCCESS } from '../actions/localeActions';

export default function localeReducer (state = 'en', action) {
    switch (action.type) {
    case SET_LOCALES_SUCCESS:
        return action.payload;
    default:
        return state;
    }
}
