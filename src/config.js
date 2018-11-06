const config = {
  allEnvs: {
    STREAMER_URL: 'https://streamer.kaiserapps.com',
    GOOGLE_CLIENT_ID: '335415163955-95tkeeqa5gbaj73jorhus66kqmnnunnr.apps.googleusercontent.com'
  },
  development: {
    BASE_URL: 'http://192.168.0.139:3000'
  },
  production: {
    BASE_URL: 'https://next.kaiserapps.com'
  }
};
export default (__DEV__ ? { ...config.allEnvs, ...config.development } : { ...config.allEnvs, ...config.production });
