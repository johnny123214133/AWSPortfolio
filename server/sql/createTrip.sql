create table if not exists trip(
	id int not null auto_increment primary key,
	route_id int not null,
	start_time datetime not null,
	best_duration int,
	avg_duration int,
	worst_duration int,
	constraint unique_trip unique(route_id, start_time)
);
