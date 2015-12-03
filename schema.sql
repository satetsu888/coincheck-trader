CREATE TABLE `trades` (
    `id` int(11) NOT NULL default '0',
    `rate` int(11) default NULL,
    `order_type` enum('sell','buy') default NULL,
    `amount` double default NULL,
    `created_at` datetime default NULL,
    PRIMARY KEY  (`id`),
    KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
