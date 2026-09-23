FROM php:8.2-apache

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Copy backend files into Apache document root
COPY backend/ /var/www/html/

# Ensure proper permissions
RUN chown -R www-data:www-data /var/www/html

# Enable directory overrides for clean .htaccess routing
RUN echo '<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/override.conf \
    && a2enconf override

# Default Apache port
EXPOSE 80

CMD ["apache2-foreground"]
