--
-- SQL setup script for the Vaultage password manager
--
-- authors: https://github.com/{lbarman,hmil}

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


CREATE DATABASE IF NOT EXISTS `vaultage` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `vaultage`;

--
-- Wiping the DB clean
--
DROP TABLE `vaultage_data`;
DROP TABLE `vaultage_users`;

--
-- The user account table
--
CREATE TABLE `vaultage_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `salt` varchar(32) NOT NULL,
  `username` varchar(64) NOT NULL,
  `remote_key` varchar(64),
  `tfa_secret` varchar(128) DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ( id )
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;

--
-- The cipher table
--
CREATE TABLE `vaultage_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `data` text CHARACTER SET utf8 NOT NULL,
  `last_hash` varchar(64) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY ( id ), 
  FOREIGN KEY (user_id) REFERENCES vaultage_users(id) 
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;


--
-- Default data
--

-- Adds the demo user (demo/demo1)
INSERT INTO `vaultage_users` (`id`, `username`, `salt`, `remote_key`, `updated`) VALUES (NULL, '${USERNAME}', '${SALT}', NULL, NULL);
