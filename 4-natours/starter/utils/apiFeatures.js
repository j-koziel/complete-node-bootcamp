// Created a class of API features so that new instances can be made anywhere...
// Makes code more ✨ re-usable ✨
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // Spreading query string into an object
    const queryObj = { ...this.queryString };
    // Fields that should be excluded from the filter
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1A) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // Execute the query with the filters in place
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    // Check if the query string even contains the sort query
    if (this.queryString.sort) {
      // Joins all the sort options into a string
      const sortBy = this.queryString.sort.split(',').join(' ');
      // Sorts the query by the specified string (sortBy)
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // Implementing pagination into the API
  paginate() {
    // Find the current page
    const page = +this.queryString.page || 1;
    // Find the limit of documents per page in the query string or set it to 100
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
