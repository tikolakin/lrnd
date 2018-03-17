// Асинхронно throw уже не работает
// ВОПРОС: как получить более полный stacktrace?
require('trace');
require('clarify');

const promise = new Promise( function(resolve, reject) {
  setTimeout(function() {
    throw new Error("WOPS");
  }, 1);
});


promise.then( function(result) {
  console.log("Result", result);
},  function(err) {
  console.log("Caught", err);
});
