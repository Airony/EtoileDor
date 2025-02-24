#!/bin/bash

# Actually user and password are EITHER in env variables   MONGO_INITDB_ROOT_USERNAME MONGO_INITDB_ROOT_PASSWORD, Or in the files with the paths stored in env variables MONGO_INITDB_ROOT_USERNAME_FILE MONGO_INITDB_ROOT_PASSWORD_FILE
# Handle it copilot please
# Check if the username is in an env variable or in a file
if [ -z "$MONGO_INITDB_ROOT_USERNAME" ]; then
    if [ -z "$MONGO_INITDB_ROOT_USERNAME_FILE" ]; then
        echo "Error: No username provided"
        exit 1
    fi
    MONGO_INITDB_ROOT_USERNAME=$(cat $MONGO_INITDB_ROOT_USERNAME_FILE)
fi

# Check if the password is in an env variable or in a file
if [ -z "$MONGO_INITDB_ROOT_PASSWORD" ]; then
    if [ -z "$MONGO_INITDB_ROOT_PASSWORD_FILE" ]; then
        echo "Error: No password provided"
        exit 1
    fi
    MONGO_INITDB_ROOT_PASSWORD=$(cat $MONGO_INITDB_ROOT_PASSWORD_FILE)
fi

echo ====================================================
echo ============= Initializing Replica Set =============
echo ====================================================

# Loop until MongoDB is ready to accept connections
until mongosh --host database:27017 --eval 'quit(0)' &>/dev/null; do
    echo "Waiting for mongod to start..."
    sleep 5
done

echo "MongoDB started. Initiating Replica Set..."

# Connect to the MongoDB service and initiate the replica set
mongosh --host database:27017 -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD --authenticationDatabase admin <<EOF
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "database:27017" }
  ]
})
EOF

echo ====================================================
echo ============= Replica Set initialized ==============
echo ====================================================
