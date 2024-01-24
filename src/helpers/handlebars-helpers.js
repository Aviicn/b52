const Handlebars = require('handlebars');



// Define a Handlebars helper to find a string in an array
Handlebars.registerHelper('findStringInArray', function(array, searchString) {
    // Check if the array and search string are defined
    if (Array.isArray(array) && searchString !== undefined) {
      // Use Array.prototype.includes() to check if the string is in the array
      return array.includes(searchString);
    } else {
      // Return false if either the array or search string is not defined
      return false;
    }
  });
  

  Handlebars.registerHelper('eq', function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
});

module.exports = Handlebars;
