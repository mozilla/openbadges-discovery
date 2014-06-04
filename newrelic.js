var config = require('./app/lib/config');
/**
 * New Relic agent configuration.
 */
exports.config = {
  app_name : [config('NEWRELIC_NAME', 'openbadges-discovery')],
  license_key : config('NEWRELIC_KEY'),
  logging : {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level : config('NEWRELIC_LOG_LEVEL', 'trace')
  }
};
