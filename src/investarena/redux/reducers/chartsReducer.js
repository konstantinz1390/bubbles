import _ from 'lodash';
import { GET_CHART_DATA_SUCCESS, GET_CHARTS_DATA_SUCCESS } from '../../redux/actions/chartsActions';
import { quoteIdForWidget } from '../../constants/constantsWidgets';

const initialState = {};

function parseCharts(charts) {
  const result = {};
  _.forEach(charts, chart => {
    const quote = _.invert(quoteIdForWidget)[chart.id];

    if (quote && chart.closeAsk) {
      result[quote] = _.map(chart.closeAsk.reverse(), (price, index) => ({
        y: +price,
        x: index,
      }));
    }
  });
  return result;
}
function updateChart(state, payload) {
  const chart = state[payload.quoteSecurity];
  if (chart) {
    return {
      ...state,
      [payload.quoteSecurity]: {
        ...chart,
        [payload.timeScale]: payload.bars,
      },
    };
  } else {
    return {
      ...state,
      [payload.quoteSecurity]: {
        [payload.timeScale]: payload.bars,
      },
    };
  }
}
export default function(state = initialState, action) {
  switch (action.type) {
    case GET_CHART_DATA_SUCCESS:
      return updateChart(state, action.payload);
    case GET_CHARTS_DATA_SUCCESS:
      return { ...state, assets: parseCharts(action.payload) };
    default:
      return state;
  }
}
