const config = {
  allEnvs: {

  },
  development: {
    BASE_URL: 'http://192.168.43.166:3000'
  },
  production: {
    BASE_URL: 'https://next.kaiserapps.com'
  }
};
export default (__DEV__ ? { ...config.allEnvs, ...config.development } : { ...config.allEnvs, ...config.production });
