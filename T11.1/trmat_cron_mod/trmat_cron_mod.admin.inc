<?php


function trmat_cron_mod_admin_settings() {

  if (variable_get('trmat_cron_mod_on', 0)) {
    drupal_set_message(t('Trainng Material cron module is active.'));
  }
  else {
    drupal_set_message(t('Training Material cron module is inactive.'));
  }

  $form['onoff'] = array(
    '#type'  => 'fieldset',
    '#title' => t('Install options'),
  );
  $form['onoff']['trmat_cron_mod_on'] = array(
    '#type'          => 'radios',
    '#title'         => t('Turn this module on or off'),
    '#default_value' => variable_get('trmat_cron_mod_on', FALSE),
    '#options'       => array(1 => t('On'), 0 => t('Off')),
    '#description'   => t('Training Materials cron activation flag.'),
  );
  $form['onoff']['trmat_cron_mod_verbose'] = array(
    '#type'          => 'radios',
    '#title'         => t('Turn cron activity verbose in watchdog'),
    '#default_value' => variable_get('trmat_cron_mod_verbose', TRUE),
    '#options'       => array(1 => t('On'), 0 => t('Off')),
    '#description'   => t('Training Materials cron activity report in watchdog'),
  );
  
  $form['mail'] = array(
    '#type'  => 'fieldset',
    '#title' => t('Mail notification settings'),
  );
  $form['mail']['trmat_cron_mod_mail_from'] = array(
    '#type'          => 'textfield',
    '#title'         => t('Mail from address'),
    '#default_value' => variable_get('trmat_cron_mod_mail_from', 'training@mailman.eosc-hub.eu'),
    '#description'   => t('Sender email address of nofified training materials'),
  );
  $form['mail']['trmat_cron_mod_mail_cc_list'] = array(
    '#type'          => 'textfield',
    '#title'         => t('Mail CC list'),
    '#default_value' => variable_get('trmat_cron_mod_mail_cc_list', 'riccardo.bruno@ct.infn.it, giuseppe.larocca@egi.eu'),
    '#description'   => t('Trainin material notification mails will be CCed to the addresses specified in this comma separated list')
  );

  $form['data'] = array(
    '#type'  => 'fieldset',
    '#title' => t('Data extraction settings'),
  );
  $form['data']['trmat_cron_mod_content_type_name'] = array(
    '#type'          => 'textfield',
    '#title'         => t('Mail from address'),
    '#default_value' => variable_get('trmat_cron_mod_content_type_name', 'Training material'),
    '#description'   => t('Content type name of Training Materials'),
  );
  $form['data']['trmat_cron_mod_notify_elapse'] = array(
    '#type'          => 'textfield',
    '#title'         => t('Notify elapse'),
    '#default_value' => variable_get('trmat_cron_mod_notify_elapse', '150'),
    '#description'   => t('Number of days to subtract to the current date, in order ' .
                          ' to build the data extraction interval'),
  );
  $form['data']['trmat_cron_mod_min_allowed_interval'] = array(
    '#type'          => 'textfield',
    '#title'         => t('Minimum allowed interval'),
    '#default_value' => variable_get('trmat_cron_mod_min_allowd_interval', '30'),
    '#description'   => t('Minimum number of days necessary to the data extraction interval before to start notification'),
  );
  $form['notify'] = array(
    '#type'  => 'fieldset',
    '#title' => t('Cron notification settings'),
  );
  $form['notify']['trmat_cron_mod_notify'] = array(
    '#type'          => 'radios',
    '#title'         => t('Cron activity notification'),
    '#default_value' => variable_get('trmat_cron_mod_notify', TRUE),
    '#options'       => array(1 => t('On'), 0 => t('Off')),
    '#description'   => t('Turn cron activity notification on or off'),
  );
  $form['notify']['trmat_cron_mod_notify_address'] = array(
    '#type'          => 'textfield',
    '#title'         => t('Notify recipient'),
    '#default_value' => variable_get('trmat_cron_mod_notify_address', 'riccardo.bruno@ct.infn.it'),
    '#description'   => t('Recipient for cron acrivity notification'),
  );   
  $form['#submit'][] = 'trmat_cron_mod_admin_settings_form_submit';
  $form = system_settings_form($form);
  $form['#submit'][] = 'trmat_cron_mod_admin_settings_submit_post_system_settings';
  return $form;
}

function trmat_cron_mod_admin_settings_form_submit() {
}

function trmat_cron_mod_admin_settings_submit_post_system_settings() {
}
