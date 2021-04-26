import Base from './Base';
import config from '../configApi/config';

export default class Forecasts extends Base {
  constructor(params) {
    super(params);

    this.getActiveForecasts = this.getActiveForecasts.bind(this);
    this.getPostsWithForecastByUser = this.getPostsWithForecastByUser.bind(this);
  }

  getActiveForecasts(name = '', quote = '') {
    return this.apiClient
      .get(`${config.forecasts.activeForecasts}?name=${name}&quote=${quote}`)
      .then(({ error, data }) => {
        if (error) return { forecasts: [] };
        return data;
      });
  }

  getPostsWithForecastByUser(name = '') {
    return this.apiClient
      .get(`${config.posts.withForecastByUser}/${name}`)
      .then(response => response.data);
  }

  getPostsWithForecastByWobject(wobjectName = '') {
    return this.apiClient
      .get(`${config.posts.withForecastBywobject}/${wobjectName}`)
      .then(response => response.data);
  }

  getStatusForecast(user, permlink) {
    return this.apiClient
      .get(`${config.quickForecasts.quickForecast}/${user}/${permlink}`)
      .then(response => response.data);
  }
}
