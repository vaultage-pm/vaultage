-- phpMyAdmin SQL Dump
-- version 4.2.6deb1
-- http://www.phpmyadmin.net
--
-- Client :  localhost
-- Généré le :  Mar 16 Février 2016 à 05:19
-- Version du serveur :  5.5.44-MariaDB-1ubuntu0.14.10.1
-- Version de PHP :  5.5.12-2ubuntu4.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Base de données :  `vaultage`
--
CREATE DATABASE IF NOT EXISTS `vaultage` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `vaultage`;

-- --------------------------------------------------------

--
-- Structure de la table `vaultage_data`
--

CREATE TABLE IF NOT EXISTS `vaultage_data` (
`id` int(11) NOT NULL,
  `last_update` datetime NOT NULL,
  `data` text CHARACTER SET utf8 NOT NULL,
  `last_hash` varchar(32) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Index pour les tables exportées
--

--
-- Index pour la table `vaultage_data`
--
ALTER TABLE `vaultage_data`
 ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- AUTO_INCREMENT pour la table `vaultage_data`
--
ALTER TABLE `vaultage_data`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;


INSERT INTO `vaultage_data` (`id`, `last_update`, `data`) VALUES
(3, '0000-00-00 00:00:00', '', 'INIT');