#!/bin/bash
#
# Starting TeSS services
#
[ "$RAILS_ENV" = "production" ] &&\
	   echo "TeSS running in production" ||\
	      echo "TeSS running in developer mode"
sudo service postgresql start 
sudo service sendmail start
redis-server &
bundle exec rake sunspot:solr:start
bundle exec sidekiq &
bundle exec rails server -b 0.0.0.0 

