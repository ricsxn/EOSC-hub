# Training Material Cron Module

This module aims to select registered training materials inside the [EOSC-hub](https://www.eosc-hub.eu) training catalogue having a given age.
Selected records will be reported to the user that inserted the material with an email that suggests him/her to check and update reported content if necessary.

## Installation

To install the module just place all module files in the directory: `<Drupal directory>/sites/all/modules/`.
Then from Drupal web site under  modules menu, activate the flag beside the `trmat_cron_module` entry and configure module setting from the Configuration menu.
This cron module depends from the [SMTP](https://www.drupal.org/project/smtp) module, available from [drupal.org](https://www.drupal.org) web site.
While configuring SMTP module, be careful to configure properly the mail server. In case of SendMail server, it could be necessary to execute the following command: `"echo <your domain> RELAY" >> /etc/mail/access`. Another important setting is the flag that enables the HTML mail format.

## Execution

The modules executes as Drupal Cron Hook, it can be also executed manually from the Drupal menu `Reports/Status Reports/run cron manually`.
The module uses the watchdog to keep track of its activity during the execution if the verbosity flag in configuration settings is switched on. Entries in the watchdog will report module entries with string `trmat_cron_mod` under `TYPE` field.

## Technical details
This module has been written for Drupal 7.59, the same version of the EOSC-hub project web site.
During the installation the module creates a table `trmat_cron_mod_nfy` that will be used to register any selected training material that has been reported during cron acrtivity.
The module extract training material records using a time interval that ranges from the last execution time to the current time, both subtracted by a given quantity of time expressed in hours. This quantity can be specified during the module configuration, together with the minimum allowed time interval value, still expressed in hours. The second parameter specify the minimum interval size necessary to report records to the users, thus avoiding too many notifications during cron executions. In case the module never run before, the starting extraction time will be set to the 1st Jan 1970 which means that all inserted records will be considered.
