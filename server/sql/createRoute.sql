create table if not exists route(
	id int not null auto_increment primary key,
	origin_id int not null,
	dest_id int not null,
	constraint unique_route unique(origin_id, dest_id)
);
