FROM mongo:7.0.14-jammy
COPY ./database/replica.key /data/replica.key
RUN chown mongodb:mongodb /data/replica.key
RUN chmod 600 /data/replica.key