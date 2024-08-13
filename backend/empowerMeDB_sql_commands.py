import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()
password = os.getenv("POSTGRES_PASSWORD")

class COMMANDS:
    def __init__(self) -> None:
        pass

    def addUserWithId(self, user_id):
        # Establish a connection to the database
        connection = psycopg2.connect(
            host="localhost",       # e.g., "localhost" or your database host
            database="empowerMeDB", # Replace with your database name
            user="postgres",        # Replace with your PostgreSQL username
            password=password       # Use the password from the environment variable
        )

        try:
            # Create a cursor object
            cursor = connection.cursor()

            # SQL query to insert a new row with the specified ID
            query = "INSERT INTO Users (id) VALUES (%s);"
            cursor.execute(query, (user_id,))

            # Commit the transaction
            connection.commit()

            print(f"User with ID {user_id} added successfully.")

        except Exception as e:
            print(f"An error occurred: {e}")
            connection.rollback()  # Rollback in case of error

        finally:
            # Close the cursor and connection
            cursor.close()
            connection.close()

            return ""

    def sendConnection(self, sender_id, receiver_id):
        connection = psycopg2.connect(
            host="localhost",       # e.g., "localhost" or your database host
            database="empowerMeDB", # Replace with your database name
            user="postgres",   # Replace with your PostgreSQL username
            password=password # Replace with your PostgreSQL password
        )

        cursor = connection.cursor()

        add_requests_query = """
        UPDATE Users
        SET requests = array_append(requests, %s)
        WHERE id = %s
        """

        add_pending_connections_query = """
        UPDATE Users
        SET pending_connections = array_append(pending_connections, %s)
        WHERE id = %s
        """

        try:
            cursor.execute(add_requests_query, (sender_id, receiver_id))
            cursor.execute(add_pending_connections_query, (receiver_id, sender_id))
            connection.commit()
            print("Connection requests updated successfully")
        except Exception as error:
            print(f"Error updating connection requests: {error}")
            connection.rollback()  # Rollback in case of error
        finally:
            cursor.close()
            connection.close()

            return ""

    def handleRequest(self, status, sender_id, receiver_id):
        connection = psycopg2.connect(
            host="localhost",       # e.g., "localhost" or your database host
            database="empowerMeDB", # Replace with your database name
            user="postgres",   # Replace with your PostgreSQL username
            password=password # Replace with your PostgreSQL password
        )

        cursor = connection.cursor()

        q1 = """
            UPDATE Users
            SET requests = array_remove(requests, %s)
            WHERE id = %s;
            """

        q2 = """
            UPDATE Users 
            SET pending_connections = array_remove(pending_connections, %s)
            WHERE id = %s
            """

        if status == "accept":
            q3 = """
                UPDATE Users 
                SET connections = array_append(connections, %s)
                WHERE id = %s
                """

            q4 = """
                UPDATE Users 
                SET connections = array_append(connections, %s)
                WHERE id = %s
                """
        else:
            q3 = """
                UPDATE Users 
                SET rejected_connections = array_append(rejected_connections, %s)
                WHERE id = %s
                """

            q4 = """
                UPDATE Users 
                SET rejected_connections = array_append(rejected_connections, %s)
                WHERE id = %s
                """
        
        try:
            cursor.execute(q1, (receiver_id, sender_id))
            cursor.execute(q2, (sender_id, receiver_id))
            cursor.execute(q3, (sender_id, receiver_id))
            cursor.execute(q4, (receiver_id, sender_id))
            connection.commit()
            print("Connection request handled successfully")
        except Exception as error:
            print(f"Error handling connection request: {error}")
            connection.rollback()  # Rollback in case of error
        finally:
            cursor.close()
            connection.close()

            return ""
        
    def getIds(self, start, column):
    # Replace these with your actual database connection details
        connection = psycopg2.connect(
            host="localhost",       # e.g., "localhost" or your database host
            database="empowerMeDB", # Replace with your database name
            user="postgres",        # Replace with your PostgreSQL username
            password=password       # Use the password from the environment variable
        )

        toRet = []

        try:
            # Create a cursor object
            cursor = connection.cursor()

            # Validate or sanitize the column name to prevent SQL injection
            if column not in ["connections", "requests", "pending_connections", "rejected_connections", "id"]:
                raise ValueError("Invalid column name")

            # Use string formatting to insert the column name
            query = f"SELECT {column} FROM Users WHERE id = %s;"
            cursor.execute(query, (start,))

            # Fetch the result
            result = cursor.fetchone()

            # Check if the result is not None
            if not result is None and not result[0] is None:
                connections_array = result[0]  # The array is the first element of the fetched tuple
                toRet = connections_array
                print(connections_array)
            else:
                toRet = []
                print("No data found for the specified ID.")

        except Exception as e:
            toRet = []
            print(f"An error occurred: {e}")

        finally:
            # Close the cursor and connection
            cursor.close()
            connection.close()

            print("toRet:", toRet)

            return toRet