export default {
  fetchToJson: (response) => response.json()
  // fetchToJson: (response) => response.text().then(text => {
  //   try {
  //     return JSON.parse(text);
  //   } catch (exception) {
  //     console.log(exception);
  //     console.log('Unable to parse response text:');
  //     console.log(text);
  //     throw exception;
  //   }
  // })
};
