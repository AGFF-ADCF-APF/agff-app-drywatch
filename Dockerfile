FROM php:8.2-apache

RUN a2enmod rewrite \
	&& sed -ri 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

COPY docker/apache-override.conf /etc/apache2/conf-available/public-override.conf
RUN a2enconf public-override

COPY src /var/www/html/src
COPY public /var/www/html/public
