import { createSelector } from 'reselect';
// selector
export const getModalsState = (state) => state.modals;

// reselect functions
export const getAllModalsState = createSelector(
  getModalsState,
  data => data.modals,
);
export const getModalIsOpenState = createSelector(
  getAllModalsState,
  (state, typeModal) => typeModal,
  (data, typeModal) => data.includes(typeModal),
);
export const getModalInfoState = createSelector(
  getModalsState,
  (state, typeModal) => typeModal,
  (data, typeModal) => data.modalsInfo[typeModal],
);
