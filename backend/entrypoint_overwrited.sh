# transform secrets to env variables
export $(egrep  -v '^#'  /run/secrets/* /dev/null | sed -E 's|/run/secrets/([^:]*?):|\1=|g') 
export MONGO_URL=mongodb://root:$(cat /run/secrets/MONGO_PASSWORD)@database:27017
echo $MONGO_URL
npm run start