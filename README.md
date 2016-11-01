# RethinkDB Utils  

A few methods to help

## Usage
### Database methods

Checks if database alreadys exits before atempting to create it.

Arguments  
db: RethinkDB database instance  
dbName: Database name


#### dropDB  
Checks if database alreadys exits before atempting to drop it.

Arguments  
db: RethinkDB database instance  
dbName: Database name



### Table methods
#### createTable   
Checks if table alreadys exits before atempting to create it. Also creates optional seconday indexes.

Argumnets  
db: RethinkDB table instance  
indexes: Array of secondary indexes
tableName: Table name  

#### dropTable  
Checks if table alreadys exits before atempting to drop it.

Argumnets  
db: RethinkDB table instance  
tableName: Table name

#### insert  
Inserts data into a table. Creates the table if does not already exist as well as optional secondary indexes.

Argumnets  
data: JSON data
db: RethinkDB table instance  
dbName: Database name  
fn: callback function which takes a single resolve argument
indexes: Array of secondary indexes  
tableName: Table name  
