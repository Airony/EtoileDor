FROM nginx:latest
COPY ./*.conf.template   /etc/nginx/templates/
COPY ./*.conf /etc/nginx/
COPY ./certificates /etc/ssl/certs/
CMD ["nginx", "-g", "daemon off;"]