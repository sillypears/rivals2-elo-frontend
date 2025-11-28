/*M!999999\- enable the sandbox mode */ 
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `characters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `character_name` varchar(45) NOT NULL,
  `display_name` varchar(45) NOT NULL,
  `release_date` date NOT NULL,
  `list_order` int(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `matches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `match_date` datetime NOT NULL,
  `elo_rank_new` int(11) NOT NULL DEFAULT -1,
  `elo_rank_old` int(11) NOT NULL DEFAULT -1,
  `elo_change` int(11) NOT NULL DEFAULT 0,
  `match_win` tinyint(4) NOT NULL DEFAULT 0,
  `match_forfeit` int(2) NOT NULL DEFAULT 0,
  `ranked_game_number` int(11) NOT NULL DEFAULT -1,
  `total_wins` int(11) NOT NULL DEFAULT -1,
  `win_streak_value` int(11) NOT NULL DEFAULT -1,
  `opponent_elo` int(11) NOT NULL DEFAULT -1,
  `opponent_estimated_elo` int(11) NOT NULL DEFAULT -1,
  `opponent_name` varchar(200) NOT NULL DEFAULT '',
  `game_1_char_pick` int(5) NOT NULL DEFAULT -1,
  `game_1_opponent_pick` int(5) NOT NULL DEFAULT -1,
  `game_1_stage` int(5) NOT NULL DEFAULT -1,
  `game_1_winner` int(11) NOT NULL DEFAULT -1,
  `game_1_final_move_id` int(3) DEFAULT -1,
  `game_1_duration` int(11) DEFAULT -1,
  `game_2_char_pick` int(5) NOT NULL DEFAULT -1,
  `game_2_opponent_pick` int(5) NOT NULL DEFAULT -1,
  `game_2_stage` int(5) NOT NULL DEFAULT -1,
  `game_2_winner` int(11) NOT NULL DEFAULT -1,
  `game_2_final_move_id` int(3) DEFAULT -1,
  `game_2_duration` int(5) DEFAULT -1,
  `game_3_char_pick` int(5) NOT NULL DEFAULT -1,
  `game_3_opponent_pick` int(5) NOT NULL DEFAULT -1,
  `game_3_stage` int(5) NOT NULL DEFAULT -1,
  `game_3_winner` int(11) NOT NULL DEFAULT -1,
  `game_3_final_move_id` int(3) DEFAULT -1,
  `game_3_duration` int(5) DEFAULT -1,
  `season_id` int(5) NOT NULL DEFAULT -1,
  `final_move_id` int(3) DEFAULT -1,
  `notes` varchar(450) DEFAULT NULL,
  PRIMARY KEY (`id`,`season_id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `unique_game_per_season` (`season_id`,`ranked_game_number`),
  KEY `game_1_stage_fk_idx` (`game_1_stage`),
  KEY `game_2_stage_fk_idx` (`game_2_stage`),
  KEY `game_3_stage_fk_idx` (`game_3_stage`),
  KEY `game_1_char_pick_fk_idx` (`game_1_char_pick`),
  KEY `game_1_opponent_pick_fk_idx` (`game_1_opponent_pick`),
  KEY `game_2_char_pick_fk_idx` (`game_2_char_pick`),
  KEY `game_2_opponent_pick_fk_idx` (`game_2_opponent_pick`),
  KEY `game_3_char_pick_fk_idx` (`game_3_char_pick`),
  KEY `game_3_opponent_pick_fk_idx` (`game_3_opponent_pick`),
  KEY `season_id_fk_idx` (`season_id`),
  KEY `final_move_fk_idx` (`final_move_id`),
  KEY `game_2_final_move_id_fk_idx` (`game_2_final_move_id`),
  KEY `game_1_final_move_id_fk_idx` (`game_1_final_move_id`),
  KEY `game_3_final_move_id_fk_idx` (`game_3_final_move_id`),
  CONSTRAINT `game_1_char_pick_fk` FOREIGN KEY (`game_1_char_pick`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `game_1_final_move_id_fk` FOREIGN KEY (`game_1_final_move_id`) REFERENCES `moves` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `game_1_opponent_pick_fk` FOREIGN KEY (`game_1_opponent_pick`) REFERENCES `characters` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `game_1_stage_fk` FOREIGN KEY (`game_1_stage`) REFERENCES `stages` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `game_2_char_pick_fk` FOREIGN KEY (`game_2_char_pick`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `game_2_final_move_id_fk` FOREIGN KEY (`game_2_final_move_id`) REFERENCES `moves` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `game_2_opponent_pick_fk` FOREIGN KEY (`game_2_opponent_pick`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `game_2_stage_fk` FOREIGN KEY (`game_2_stage`) REFERENCES `stages` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `game_3_char_pick_fk` FOREIGN KEY (`game_3_char_pick`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `game_3_final_move_id_fk` FOREIGN KEY (`game_3_final_move_id`) REFERENCES `moves` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `game_3_opponent_pick_fk` FOREIGN KEY (`game_3_opponent_pick`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `game_3_stage_fk` FOREIGN KEY (`game_3_stage`) REFERENCES `stages` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2335 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`blap`@`172.17.%`*/ /*!50003 TRIGGER set_season_id_before_insert
BEFORE INSERT ON matches
FOR EACH ROW
BEGIN
  DECLARE matched_season_id INT;

  SELECT id INTO matched_season_id
  FROM seasons
  WHERE NEW.match_date BETWEEN start_date AND end_date
  LIMIT 1;

  IF matched_season_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'No matching season found for match_date';
  ELSE
    SET NEW.season_id = matched_season_id;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `matches_vw` AS SELECT
 1 AS `id`,
  1 AS `match_date`,
  1 AS `elo_rank_new`,
  1 AS `elo_rank_old`,
  1 AS `elo_change`,
  1 AS `match_win`,
  1 AS `match_forfeit`,
  1 AS `ranked_game_number`,
  1 AS `total_wins`,
  1 AS `win_streak_value`,
  1 AS `opponent_elo`,
  1 AS `opponent_estimated_elo`,
  1 AS `opponent_name`,
  1 AS `game_1_char_pick`,
  1 AS `game_1_char_pick_name`,
  1 AS `game_1_char_pick_image`,
  1 AS `game_1_opponent_pick`,
  1 AS `game_1_opponent_pick_name`,
  1 AS `game_1_opponent_pick_image`,
  1 AS `game_1_stage`,
  1 AS `game_1_stage_name`,
  1 AS `game_1_winner`,
  1 AS `game_1_final_move_id`,
  1 AS `game_1_final_move_name`,
  1 AS `game_1_final_move_short`,
  1 AS `game_1_duration`,
  1 AS `game_2_char_pick`,
  1 AS `game_2_char_pick_name`,
  1 AS `game_2_char_pick_image`,
  1 AS `game_2_opponent_pick`,
  1 AS `game_2_opponent_pick_name`,
  1 AS `game_2_opponent_pick_image`,
  1 AS `game_2_stage`,
  1 AS `game_2_stage_name`,
  1 AS `game_2_winner`,
  1 AS `game_2_final_move_id`,
  1 AS `game_2_final_move_name`,
  1 AS `game_2_final_move_short`,
  1 AS `game_2_duration`,
  1 AS `game_3_char_pick`,
  1 AS `game_3_char_pick_name`,
  1 AS `game_3_char_pick_image`,
  1 AS `game_3_opponent_pick`,
  1 AS `game_3_opponent_pick_name`,
  1 AS `game_3_opponent_pick_image`,
  1 AS `game_3_stage`,
  1 AS `game_3_stage_name`,
  1 AS `game_3_winner`,
  1 AS `game_3_final_move_id`,
  1 AS `game_3_final_move_name`,
  1 AS `game_3_final_move_short`,
  1 AS `game_3_duration`,
  1 AS `season_id`,
  1 AS `season_short_name`,
  1 AS `season_display_name`,
  1 AS `final_move_id`,
  1 AS `final_move_short`,
  1 AS `final_move_name`,
  1 AS `notes` */;
SET character_set_client = @saved_cs_client;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `moves` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `display_name` varchar(45) NOT NULL,
  `short_name` varchar(45) NOT NULL,
  `list_order` int(3) DEFAULT NULL,
  `category` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `display_name_UNIQUE` (`display_name`),
  UNIQUE KEY `short_name_UNIQUE` (`short_name`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `short_name` varchar(100) DEFAULT NULL,
  `display_name` varchar(100) DEFAULT NULL,
  `base_leaderboard` varchar(50) DEFAULT NULL,
  `pure_leaderboard` varchar(50) DEFAULT NULL,
  `season_index` int(3) DEFAULT NULL,
  `steam_leaderboard` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `stages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stage_name` varchar(45) NOT NULL,
  `display_name` varchar(45) NOT NULL,
  `counter_pick` int(11) NOT NULL DEFAULT 1,
  `list_order` int(3) DEFAULT NULL,
  `stage_type` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `stage_name_UNIQUE` (`stage_name`),
  UNIQUE KEY `display_name_UNIQUE` (`display_name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tiers` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `tier_display_name` varchar(45) DEFAULT NULL,
  `tier_short_name` varchar(45) DEFAULT NULL,
  `min_threshold` int(10) DEFAULT NULL,
  `max_threshold` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50001 DROP VIEW IF EXISTS `matches_vw`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`blap`@`172.17.%` SQL SECURITY INVOKER */
/*!50001 VIEW `matches_vw` AS select `m`.`id` AS `id`,`m`.`match_date` AS `match_date`,`m`.`elo_rank_new` AS `elo_rank_new`,`m`.`elo_rank_old` AS `elo_rank_old`,`m`.`elo_change` AS `elo_change`,`m`.`match_win` AS `match_win`,`m`.`match_forfeit` AS `match_forfeit`,`m`.`ranked_game_number` AS `ranked_game_number`,`m`.`total_wins` AS `total_wins`,`m`.`win_streak_value` AS `win_streak_value`,`m`.`opponent_elo` AS `opponent_elo`,`m`.`opponent_estimated_elo` AS `opponent_estimated_elo`,`m`.`opponent_name` AS `opponent_name`,`m`.`game_1_char_pick` AS `game_1_char_pick`,`cs1`.`display_name` AS `game_1_char_pick_name`,`cs1`.`character_name` AS `game_1_char_pick_image`,`m`.`game_1_opponent_pick` AS `game_1_opponent_pick`,`co1`.`display_name` AS `game_1_opponent_pick_name`,`co1`.`character_name` AS `game_1_opponent_pick_image`,`m`.`game_1_stage` AS `game_1_stage`,`s1`.`display_name` AS `game_1_stage_name`,`m`.`game_1_winner` AS `game_1_winner`,`m`.`game_1_final_move_id` AS `game_1_final_move_id`,`mo1`.`display_name` AS `game_1_final_move_name`,`mo1`.`short_name` AS `game_1_final_move_short`,`m`.`game_1_duration` AS `game_1_duration`,`m`.`game_2_char_pick` AS `game_2_char_pick`,`cs2`.`display_name` AS `game_2_char_pick_name`,`cs2`.`character_name` AS `game_2_char_pick_image`,`m`.`game_2_opponent_pick` AS `game_2_opponent_pick`,`co2`.`display_name` AS `game_2_opponent_pick_name`,`co2`.`character_name` AS `game_2_opponent_pick_image`,`m`.`game_2_stage` AS `game_2_stage`,`s2`.`display_name` AS `game_2_stage_name`,`m`.`game_2_winner` AS `game_2_winner`,`m`.`game_2_final_move_id` AS `game_2_final_move_id`,`mo2`.`display_name` AS `game_2_final_move_name`,`mo2`.`short_name` AS `game_2_final_move_short`,`m`.`game_2_duration` AS `game_2_duration`,`m`.`game_3_char_pick` AS `game_3_char_pick`,`cs3`.`display_name` AS `game_3_char_pick_name`,`cs3`.`character_name` AS `game_3_char_pick_image`,`m`.`game_3_opponent_pick` AS `game_3_opponent_pick`,`co3`.`display_name` AS `game_3_opponent_pick_name`,`co3`.`character_name` AS `game_3_opponent_pick_image`,`m`.`game_3_stage` AS `game_3_stage`,`s3`.`display_name` AS `game_3_stage_name`,`m`.`game_3_winner` AS `game_3_winner`,`m`.`game_3_final_move_id` AS `game_3_final_move_id`,`mo3`.`display_name` AS `game_3_final_move_name`,`mo3`.`short_name` AS `game_3_final_move_short`,`m`.`game_3_duration` AS `game_3_duration`,`m`.`season_id` AS `season_id`,`sz`.`short_name` AS `season_short_name`,`sz`.`display_name` AS `season_display_name`,`m`.`final_move_id` AS `final_move_id`,`mo`.`short_name` AS `final_move_short`,`mo`.`display_name` AS `final_move_name`,`m`.`notes` AS `notes` from ((((((((((((((`matches` `m` left join `stages` `s1` on(`m`.`game_1_stage` = `s1`.`id`)) left join `stages` `s2` on(`m`.`game_2_stage` = `s2`.`id`)) left join `stages` `s3` on(`m`.`game_3_stage` = `s3`.`id`)) left join `characters` `cs1` on(`m`.`game_1_char_pick` = `cs1`.`id`)) left join `characters` `co1` on(`m`.`game_1_opponent_pick` = `co1`.`id`)) left join `characters` `cs2` on(`m`.`game_2_char_pick` = `cs2`.`id`)) left join `characters` `co2` on(`m`.`game_2_opponent_pick` = `co2`.`id`)) left join `characters` `cs3` on(`m`.`game_3_char_pick` = `cs3`.`id`)) left join `characters` `co3` on(`m`.`game_3_opponent_pick` = `co3`.`id`)) left join `moves` `mo` on(`m`.`final_move_id` = `mo`.`id`)) left join `moves` `mo1` on(`m`.`game_1_final_move_id` = `mo1`.`id`)) left join `moves` `mo2` on(`m`.`game_2_final_move_id` = `mo2`.`id`)) left join `moves` `mo3` on(`m`.`game_3_final_move_id` = `mo3`.`id`)) left join (select `s`.`id` AS `id`,`s`.`short_name` AS `short_name`,`s`.`display_name` AS `display_name`,`s`.`start_date` AS `start_date`,`s`.`end_date` AS `end_date` from `seasons` `s`) `sz` on(`m`.`match_date` between `sz`.`start_date` and `sz`.`end_date`)) order by `m`.`match_date` desc,`m`.`ranked_game_number` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
