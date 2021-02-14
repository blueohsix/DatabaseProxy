## Database Proxy
#### Allows the usage of a single repl.it key-value database across other REPLs or externally hosted projects. Feel free to modify this to suite your needs.
[About the Repl.it database](https://docs.repl.it/misc/database)

By default, this proxy is set up to use Basic Auth. All requests will return a 401 status code until an Authorization header is passed that contains credentials in the database. 

### To add credentials to the database:
- Uncomment the first line of server.js to get your REPLIT_DB_URL via the Console tab.
- Because we're persisting straight to the database, we'll want to [Base 64 encode](https://www.base64encode.org/) our password, just as a minimum level of security. 
```
curl REPLIT_DB_URL -d users:YourUserNameHere=YourBase64EncodedPasswordHere
``` 
The _users:_ prefix is intended as a schema for easy separation of user keys from other keys. Feel free to use something different. Note that without a prefix, any key-value could be used to access the database. See server.js line 13.

Once you have added yourself to the database, the below routes are accessible.
### Routes
Each of these routes are prefixed with the publicly accessible ...repl.co URL. 

GET
```/list``` ** Get all keys **
```/list/prefix``` ** Get all keys beginning with a prefix ** 
Keys are returned in an array: ['Captain Keyes', 'Pillar of Autumn', 'High Charity'] 
```/key``` ** Get the value of a key ** 

POST
```/key/value``` ** Adds a new key-value pair **
Key and value in the URL. Not recommended for values that contain special characters.
```/key``` ** Adds a new key-value pair **
Key in the URL, value in the Body.  Recommended for values that contain special characters or long text.

PUT
```/key/value``` ** Updates an existing key-value pair **
Key and value in the URL. Not recommended for special characters.
```/key``` ** Updates an existing key-value pair **
Key in the URL, value in the Body.

DELETE
```/key``` ** Deletes a key **

**_Special Routes_**

POST
```/Users/Add/NewUsername``` ** Adds a new User **
Username in the URL, plaintext password in the body.

PUT
```/Users/Update/ExistingUsername``` ** Updates user password **
Username in the URL, plaintext password in the body.

DELETE
```/purgeDatabase/confirm``` ** Returns confirmation number **
Returns a random number that is used for verifying the emptying of the database. 
```/purgeDatabase/confirm/confirmationNumber``` ** Purges all key-value pairs **
Confirmation number in the URL. Returns instructions for creating a new user via CURL. 

