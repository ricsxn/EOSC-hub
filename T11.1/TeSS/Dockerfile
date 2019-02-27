# OS 
FROM ruby:2.2

# Maintainer
MAINTAINER Riccardo Bruno <riccardo.bruno@ct.infn.it>

# Package Installation and TeSS cloning
ENV TESS_REPO https://github.com/ElixirTeSS/TeSS.git
RUN apt-get update &&\
    apt-get install -y --no-install-recommends build-essential sudo git \
            postgresql libpq-dev imagemagick openjdk-7-jre nodejs\
            sendmail mlocate vim &&\
    sudo echo "www-data ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers &&\
    apt-get clean &&\
    rm -rf /var/lib/apt/lists/* &&\
    git clone $TESS_REPO 

USER www-data
# Uncomment the following for production TeSS
ENV RAILS_ENV production
ENV APP_DIR /TeSS
WORKDIR $APP_DIR

# Setup workdir and www-data ownership to TeSS
RUN sudo chown -R www-data $APP_DIR
RUN sudo mkdir -p /var/www
RUN sudo chown -R www-data /var/www

# Complete installation as www-data user
RUN curl -sSL https://rvm.io/mpapis.asc | gpg --import - &&\
    curl -L https://s.diaspora.software/1t | bash &&\
    echo "[[ -s \"\$HOME/.rvm/scripts/rvm\" ]] && source \"\$HOME/.rvm/scripts/rvm\"" >> ~/.bashrc &&\
    echo "alias ls='ls --color'" >> ~/.bashrc &&\
    echo "alias ll='ls -l'" >> ~/.bashrc &&\
    wget http://download.redis.io/releases/redis-2.8.19.tar.gz &&\
    tar xzf redis-2.8.19.tar.gz &&\
    cd redis-2.8.19 &&\
    make &&\
    sudo make install

# Copy start_tess.sh script
ADD start_tess.sh /TeSS

# Building TeSS
RUN /bin/bash --login -c "\
    rvm install `cat .ruby-version` &&\
    rvm autolibs read-fail &&\
    rvm install 2.2 &&\
    rvm use --create `cat .ruby-version`@`cat .ruby-gemset` &&\
    gem install bundler &&\
    bundle install"

# Postgres
RUN sudo service postgresql start && sleep 60 &&\
    sudo su postgres -c "createuser --superuser tess_user" &&\
    sudo su postgres -c "psql -c \"ALTER USER tess_user PASSWORD 'tess_pwd';\"" &&\
    sudo su postgres -c "psql -c \"ALTER USER tess_user CREATEDB;\""

# Fix on postgres template1
RUN sudo service postgresql start && sleep 60 &&\
 sudo su postgres -c "psql -c \"UPDATE pg_database SET datistemplate = FALSE WHERE datname = 'template1';\"" &&\
 sudo su postgres -c "psql -c \"DROP DATABASE template1;\"" &&\
 sudo su postgres -c "psql -c \"CREATE DATABASE template1 WITH TEMPLATE = template0 ENCODING = 'UTF8';\"" &&\
 sudo su postgres -c "psql -c \"UPDATE pg_database SET datistemplate = TRUE WHERE datname = 'template1';\"" &&\
 sudo su postgres -c "psql -c \"\\c template1\"" &&\
 sudo su postgres -c "psql -c \"VACUUM FREEZE;\""

# TeSS Config
RUN cp config/tess.example.yml config/tess.yml;\
    cp config/sunspot.example.yml config/sunspot.yml;\
    cp config/secrets.example.yml config/secrets.yml

# Create environment
ENV SECRET_KEY_BASE 01234567890ABCDEF
# DB test credentials
ENV TESS_DB_USER tess_user
ENV TESS_DB_PASSWORD tess_pwd
RUN sed -i "s/awesome_secure_password/$TESS_DB_PASSWORD/" config/secrets.yml
# Mail settings
ENV TESS_BASEURL 212.189.145.33
ENV TESS_CONTACT ehtc@ct.infn.it
ENV TESS_RPLTO riccardo.bruno@ct.infn.it
RUN sed -i "s/localhost.localdomain/$TESS_BASEURL/" config/secrets.yml
RUN sed -i "s/localhost:/$TESS_BASEURL:/" config/tess.yml
RUN sed -i "s/no-reply@localhost/$TESS_RPLTO/" config/tess.yml
RUN sed -i "s/contact@example.com/$TESS_CONTACT/" config/tess.yml
# AAI settings
ENV EGIJWK https://aai-dev.egi.eu/oidc/jwk
ENV TESS_CLIENTID f4c32ea7-33a0-4b49-9bc0-8ecc19657b6c
ENV TESS_SECRET AJMBSg9a8ol_gVPwUv1cWNlmc214-FHetmG757kUSpgj3E8-VD2YTWo9rhGHMcbiswpYJD2oLcBu3GoHLbi8ojQ
ENV TESS_ISSUER aai-dev.egi.eu
RUN sed -i "s/#client/$TESS_CLIENTID/" config/secrets.yml
RUN sed -i "s/#secret/$TESS_SECRET/" config/secrets.yml
RUN sed -i "s/login.elixir-czech.org/$TESS_ISSUER/g" config/initializers/devise.rb 
RUN JWK=$(curl $EGIJWK);\
    CLIENT_JWK_LINE=$(grep -n 'client_jwk_signing_key' config/initializers/devise.rb | awk -F":" '{ print $1 }');\
    cat config/initializers/devise.rb | head -n $((CLIENT_JWK_LINE-1)) > /tmp/1;\
    DEVISE_LINES=$(cat config/initializers/devise.rb | wc -l);\
    cat config/initializers/devise.rb | tail -n $((DEVISE_LINES-CLIENT_JWK_LINE)) > /tmp/2;\
    echo "        client_jwk_signing_key: '"$JWK"'," >> /tmp/1;\
    mv config/initializers/devise.rb config/initializers/devise.rb_orig;\
    cat /tmp/1 /tmp/2 > config/initializers/devise.rb

# DB production credentials
ENV PRODUCTION_DB_USER tess_user
ENV PRODUCTION_DB_PASSWORD tess_pwd

# Create DB, Start Solr, Reindex Solr, DB Setup
RUN /bin/bash --login -c "\
 sudo service postgresql start;\
 sleep 60;\
 bundle exec rake db:create:all;\
 bundle exec rake sunspot:solr:start;\
 bundle exec rake db:setup;\
 bundle exec rake assets:precompile && rm -rf tmp/cache/*;\
 bundle exec rake sunspot:solr:reindex"

# Run test suite
#RUN /bin/bash --login -c "service postgresql start;\
# bundle exec rake db:test:prepare;\
# bundle exec rake test"

# root access needed for next couple of steps
USER root

# NGINX config
COPY nginx.conf /etc/nginx/nginx.conf

# Cleanup
RUN rm -rf /tmp/* /var/tmp/*

USER www-data

# Make TeSS port 3000 available to the world outside this container
EXPOSE 3000

# Run TeSS  when the container launches
CMD /bin/bash --login -c "./start_tess.sh"

