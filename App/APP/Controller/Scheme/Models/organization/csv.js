

/**
---CSV should return an object with property head and data.
 
  head should be an array of the title for the table
  data can either be an array or a function. The array contains the nested keys 
  of the table

  if data is a function it will be called for each record. it should return  
  an array of the different 

 
 **/

  /**
   Un comment IF YOU NEED IT.
   The line below to use escapeCsvValue which evaluates a string and escapes ',' and 
 so your csv document is not ruined.  
   * **/
  //const escapeCsvValue = require("./../../Utils/Scheme/csv/escapeCsvValue");

  const csv={
   head:[],
   data:[]
  }


  module.exports=csv
