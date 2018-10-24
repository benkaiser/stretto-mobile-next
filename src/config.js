const config = {
  allEnvs: {
    STREAMER_URL: 'https://streamer.kaiserapps.com'
  },
  development: {
    BASE_URL: 'http://192.168.0.139:3000'
  },
  production: {
    BASE_URL: 'https://next.kaiserapps.com'
  }
};
export default (__DEV__ ? { ...config.allEnvs, ...config.development } : { ...config.allEnvs, ...config.production });
