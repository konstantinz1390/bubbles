// import api from 'configApi/apiResources';
import Cookies from 'js-cookie';
// import { showNotification } from 'redux/actions/ui/notificationActions';

export const SET_LOCALES_SUCCESS = 'SET_LOCALES_SUCCESS';

// export function setLocale (language) {
//     return (dispatch) => {
//         return api.locales.setLocale(language)
//             .then(({ error }) => {
//                 if (!error) {
//                     setLocaleCookie(language);
//                 } else {
//                     dispatch(showNotification({ status: 'error', message: error.toString() }));
//                 }
//             });
//     };
// }

export function setLocaleCookie (language) {
    Cookies.set('locale', language);
    window.location.reload();
}

export function setLocaleSuccess (locale) {
    return { type: SET_LOCALES_SUCCESS, payload: locale };
}
