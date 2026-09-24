DELETE FROM settings;
DELETE FROM teams;
DELETE FROM matches;
DELETE FROM admin_audit;
INSERT INTO settings(key,value) VALUES
('event_name','TKJ SMKSA CHAMPIONSHIP 2026'),
('organizer','TKJ SMKSA'),
('subtitle','Mobile Legends & Pro Evolution Soccer'),
('location','SMKSA'),
('status','Penyisihan Grup'),
('primary_color','#7c3aed'),
('secondary_color','#06b6d4'),
('win_points','3'),('draw_points','1'),('loss_points','0'),
('advance_per_group','2'),('public_refresh_seconds','15');
INSERT INTO teams(name,short_name,group_name) VALUES ("Tim 01","T01","A");
INSERT INTO teams(name,short_name,group_name) VALUES ("Tim 02","T02","A");
INSERT INTO teams(name,short_name,group_name) VALUES ("Tim 03","T03","A");
INSERT INTO teams(name,short_name,group_name) VALUES ("Tim 04","T04","A");
INSERT INTO teams(name,short_name,group_name) VALUES ("Tim 05","T05","A");
INSERT INTO teams(name,short_name,group_name) VALUES ("Tim 06","T06","A");
INSERT INTO teams(name,short_name,group_name) VALUES ("Tim 07","T07","B");
INSERT INTO teams(name,short_name,group_name) VALUES ("Tim 08","T08","B");
INSERT INTO teams(name,short_name,group_name) VALUES ("Tim 09","T09","B");
INSERT INTO teams(name,short_name,group_name) VALUES ("Tim 10","T10","B");
INSERT INTO teams(name,short_name,group_name) VALUES ("Tim 11","T11","B");
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("Mobile Legends",'Group',"A",'Penyisihan',1,"2026-10-29","15:00",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("PES",'Group',"B",'Penyisihan',2,"2026-10-29","16:30",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("PES",'Group',"A",'Penyisihan',3,"2026-11-05","15:00",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("Mobile Legends",'Group',"B",'Penyisihan',4,"2026-11-05","16:30",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("Mobile Legends",'Group',"A",'Penyisihan',5,"2026-11-12","15:00",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("PES",'Group',"B",'Penyisihan',6,"2026-11-12","16:30",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("PES",'Group',"A",'Penyisihan',7,"2026-11-19","15:00",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("Mobile Legends",'Group',"B",'Penyisihan',8,"2026-11-19","16:30",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("Mobile Legends",'Group',"A",'Penyisihan',9,"2026-11-26","15:00",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("PES",'Group',"B",'Penyisihan',10,"2026-11-26","16:30",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("PES",'Group',"A",'Penyisihan',11,"2026-12-03","15:00",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("Mobile Legends",'Group',"B",'Penyisihan',12,"2026-12-03","16:30",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("Mobile Legends",'Group',"A",'Penyisihan',13,"2026-12-10","15:00",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("PES",'Group',"B",'Penyisihan',14,"2026-12-10","16:30",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("PES",'Group',"A",'Penyisihan',15,"2026-12-17","15:00",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
INSERT INTO matches(sport,stage,group_name,round_name,match_no,date,time,venue,status,notes) VALUES ("Mobile Legends",'Group',"B",'Penyisihan',16,"2026-12-17","16:30",'Aula / Lab TKJ','Scheduled','Data awal; edit di Admin');
