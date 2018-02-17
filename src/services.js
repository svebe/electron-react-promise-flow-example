// @flow
import * as mysql from 'mysql';

// Setup database server reconnection when server timeouts connection:
let connection;
function connect() {
  connection = mysql.createConnection({
    host: 'mysql.stud.iie.ntnu.no',
    user: '[username]',
    password: '[password]',
    database: '[username]'
  });

  // Connect to MySQL-server
  connection.connect((error) => {
    if (error) throw error; // If error, show error in console and return from this function
  });

  // Add connection error handler
  connection.on('error', (error: Error) => {
    if (error.code === 'PROTOCOL_CONNECTION_LOST') { // Reconnect if connection to server is lost
      connect();
    }
    else {
      throw error;
    }
  });
}
connect();

class User {
  id: number;
  username: string;
  firstName: string;
}

class UserService {
  signIn(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM Users where username=?', [username], (error, result) => {
        if(error) {
          reject(error);
          return;
        }
        if(result.length!=1) {
          reject(new Error('Result length was not 1'))
          return;
        }

        localStorage.setItem('signedInUser', JSON.stringify(result[0])); // Store User-object in browser
        resolve();
      });
    });
  }

  getSignedInUser(): ?User {
    let item = localStorage.getItem('signedInUser'); // Get User-object from browser
    if(!item) return null;

    return JSON.parse(item);
  }

  getFriends(id: number): Promise<User[]> {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM Users where id!=?', [id], (error, result) => {
        if(error) {
          reject(error);
          return;
        }

        resolve(result);
      });
    });
  }
}

let userService = new UserService();

export { User, userService };
