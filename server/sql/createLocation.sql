create table if not exists location(
	id int not null auto_increment primary key,
	address varchar(255) not null,
	lat decimal(10,8) not null,
	lng decimal(11,8) not null,
	unique(address),
	constraint unique_coords unique(lat, lng)
);
