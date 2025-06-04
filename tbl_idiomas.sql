CREATE TABLE `tbl_idiomas` (
  `idIdioma` int NOT NULL AUTO_INCREMENT primary key,
  `prefijo` varchar(5) NOT NULL,
  `idioma` varchar(50) NOT NULL)Engine=InnoDB;

INSERT INTO `tbl_idiomas` (`idIdioma`, `prefijo`, `idioma`)
VALUES
	(1,'ar','Argentina'),
	(2,'ca','Colombia'),
	(3,'vz','Venezuela'),
	(4,'cl','Chile'),
	(5,'mx','Mexico');