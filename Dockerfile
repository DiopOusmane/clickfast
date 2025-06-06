# Utilisation d'une image de base Nginx
FROM nginx:alpine

# Copie du projet dans le dossier de Nginx
COPY . /usr/share/nginx/html

# Exposition du port 80
EXPOSE 80

# Commande par défaut pour démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]