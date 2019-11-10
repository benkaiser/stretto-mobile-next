const config = {
  allEnvs: {
    STREAMER_URL: 'https://streamer.kaiserapps.com'
  },
  development: {
    BASE_URL: 'http://192.168.0.187:3000',
    GOOGLE_CLIENT_ID: '335415163955-qacqqe8jd9io5dmv6gkgnqvd807ev17h.apps.googleusercontent.com'
  },
  production: {
    BASE_URL: 'https://next.kaiserapps.com',
    GOOGLE_CLIENT_ID: '335415163955-8ee9491jbrvk9gi6cprvucrm5oucf9fi.apps.googleusercontent.com'
  }
};
export default (__DEV__ ? { ...config.allEnvs, ...config.development } : { ...config.allEnvs, ...config.production });
