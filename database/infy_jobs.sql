-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 30-01-2023 a las 15:39:17
-- Versión del servidor: 10.6.11-MariaDB-0ubuntu0.22.04.1
-- Versión de PHP: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `soco_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `branding_sliders`
--

CREATE TABLE `branding_sliders` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(191) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `candidates`
--

CREATE TABLE `candidates` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `unique_id` varchar(191) NOT NULL,
  `father_name` varchar(191) DEFAULT NULL,
  `marital_status_id` int(10) UNSIGNED DEFAULT NULL,
  `nationality` varchar(191) DEFAULT NULL,
  `national_id_card` varchar(191) DEFAULT NULL,
  `experience` int(11) DEFAULT NULL,
  `career_level_id` int(10) UNSIGNED DEFAULT NULL,
  `industry_id` int(10) UNSIGNED DEFAULT NULL,
  `functional_area_id` int(10) UNSIGNED DEFAULT NULL,
  `current_salary` double DEFAULT NULL,
  `expected_salary` double DEFAULT NULL,
  `salary_currency` varchar(191) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `immediate_available` tinyint(1) NOT NULL DEFAULT 1,
  `available_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `job_alert` tinyint(1) NOT NULL DEFAULT 0,
  `last_change` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `candidate_educations`
--

CREATE TABLE `candidate_educations` (
  `id` int(10) UNSIGNED NOT NULL,
  `candidate_id` int(10) UNSIGNED NOT NULL,
  `degree_level_id` int(10) UNSIGNED NOT NULL,
  `degree_title` varchar(191) NOT NULL,
  `country_id` bigint(20) UNSIGNED DEFAULT NULL,
  `state_id` bigint(20) UNSIGNED DEFAULT NULL,
  `city_id` bigint(20) UNSIGNED DEFAULT NULL,
  `institute` varchar(191) NOT NULL,
  `result` varchar(191) NOT NULL,
  `year` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `candidate_experiences`
--

CREATE TABLE `candidate_experiences` (
  `id` int(10) UNSIGNED NOT NULL,
  `candidate_id` int(10) UNSIGNED NOT NULL,
  `experience_title` varchar(191) NOT NULL,
  `company` varchar(191) NOT NULL,
  `country_id` bigint(20) UNSIGNED DEFAULT NULL,
  `state_id` bigint(20) UNSIGNED DEFAULT NULL,
  `city_id` bigint(20) UNSIGNED DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `currently_working` tinyint(1) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `candidate_language`
--

CREATE TABLE `candidate_language` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `language_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `candidate_skills`
--

CREATE TABLE `candidate_skills` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `skill_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `career_levels`
--

CREATE TABLE `career_levels` (
  `id` int(10) UNSIGNED NOT NULL,
  `level_name` varchar(170) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `career_levels`
--

INSERT INTO `career_levels` (`id`, `level_name`, `created_at`, `updated_at`, `is_default`) VALUES
(1, 'Entry', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(2, 'Intermediate', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(3, 'Senior', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(4, 'Highly Skilled', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(5, 'Specialist', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(6, 'Developing', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(7, 'Advanced', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(8, 'Expert', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(9, 'Principal', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(10, 'Supervisor', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(11, 'Sr. Supervisor', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(12, 'Manager', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(13, 'Sr. Manager', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(14, 'Director', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(15, 'Sr. Director', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(16, 'Vice President', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cities`
--

CREATE TABLE `cities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `state_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cities`
--

INSERT INTO `cities` (`id`, `state_id`, `name`, `created_at`, `updated_at`) VALUES
(38131, 3255, 'ALbatera', NULL, NULL),
(38132, 3255, 'Alacant', NULL, NULL),
(38133, 3255, 'Alcoi', NULL, NULL),
(38134, 3255, 'Almoradi', NULL, NULL),
(38135, 3255, 'Altea', NULL, NULL),
(38136, 3255, 'Aspe', NULL, NULL),
(38137, 3255, 'Benidorm', NULL, NULL),
(38138, 3255, 'Benissa', NULL, NULL),
(38139, 3255, 'Callosa de Segura', NULL, NULL),
(38140, 3255, 'Calp', NULL, NULL),
(38141, 3255, 'Cocentaina', NULL, NULL),
(38142, 3255, 'Crevillent', NULL, NULL),
(38143, 3255, 'Denia', NULL, NULL),
(38144, 3255, 'El Campello', NULL, NULL),
(38145, 3255, 'Elda', NULL, NULL),
(38146, 3255, 'Elx', NULL, NULL),
(38147, 3255, 'Guardamar del Segura', NULL, NULL),
(38148, 3255, 'Ibi', NULL, NULL),
(38149, 3255, 'L\'\'Alfas del Pi', NULL, NULL),
(38150, 3255, 'La Vila Joiosa', NULL, NULL),
(38151, 3255, 'Monover', NULL, NULL),
(38152, 3255, 'Mutxamel', NULL, NULL),
(38153, 3255, 'Novelda', NULL, NULL),
(38154, 3255, 'Orihuela', NULL, NULL),
(38155, 3255, 'Pedreguer', NULL, NULL),
(38156, 3255, 'Pego', NULL, NULL),
(38157, 3255, 'Petrer', NULL, NULL),
(38158, 3255, 'Pilar de la Horadada', NULL, NULL),
(38159, 3255, 'Pinoso', NULL, NULL),
(38160, 3255, 'Rojales', NULL, NULL),
(38161, 3255, 'Sant Joan d\'\'Alacant', NULL, NULL),
(38162, 3255, 'Sant Vicent del Raspeig', NULL, NULL),
(38163, 3255, 'Santa Pola', NULL, NULL),
(38164, 3255, 'Sax', NULL, NULL),
(38165, 3255, 'Teulada', NULL, NULL),
(38166, 3255, 'Torrevieja', NULL, NULL),
(38167, 3255, 'Villena', NULL, NULL),
(38168, 3255, 'Xabia', NULL, NULL),
(38169, 3256, 'Amurrio', NULL, NULL),
(38170, 3256, 'Llodio', NULL, NULL),
(38171, 3256, 'Vitoria', NULL, NULL),
(38172, 3257, 'Albacete', NULL, NULL),
(38173, 3257, 'Almansa', NULL, NULL),
(38174, 3257, 'Caudete', NULL, NULL),
(38175, 3257, 'Hellin', NULL, NULL),
(38176, 3257, 'La Roda', NULL, NULL),
(38177, 3257, 'Villarrobledo', NULL, NULL),
(38178, 3258, 'Adra', NULL, NULL),
(38179, 3258, 'Albox', NULL, NULL),
(38180, 3258, 'Almeria', NULL, NULL),
(38181, 3258, 'Berja', NULL, NULL),
(38182, 3258, 'Cuevas del Almanzora', NULL, NULL),
(38183, 3258, 'El Ejido', NULL, NULL),
(38184, 3258, 'Huercal de Almeria', NULL, NULL),
(38185, 3258, 'Huercal-Overa', NULL, NULL),
(38186, 3258, 'Nijar', NULL, NULL),
(38187, 3258, 'Roquetas de Mar', NULL, NULL),
(38188, 3258, 'Vicar', NULL, NULL),
(38189, 3259, 'Benalmadena', NULL, NULL),
(38190, 3260, 'Aller', NULL, NULL),
(38191, 3260, 'Aviles', NULL, NULL),
(38192, 3260, 'C/ Pena Salon', NULL, NULL),
(38193, 3260, 'Cangas del Narcea', NULL, NULL),
(38194, 3260, 'Carreno', NULL, NULL),
(38195, 3260, 'Castrillon', NULL, NULL),
(38196, 3260, 'Corvera de Asturias', NULL, NULL),
(38197, 3260, 'Gijon', NULL, NULL),
(38198, 3260, 'Gozon', NULL, NULL),
(38199, 3260, 'Grado', NULL, NULL),
(38200, 3260, 'Langreo', NULL, NULL),
(38201, 3260, 'Laviana', NULL, NULL),
(38202, 3260, 'Lena', NULL, NULL),
(38203, 3260, 'Llanera', NULL, NULL),
(38204, 3260, 'Llanes', NULL, NULL),
(38205, 3260, 'Mieres', NULL, NULL),
(38206, 3260, 'Navia', NULL, NULL),
(38207, 3260, 'Oviedo', NULL, NULL),
(38208, 3260, 'Pilona', NULL, NULL),
(38209, 3260, 'Pravia', NULL, NULL),
(38210, 3260, 'San Martin del Rey Aurelio', NULL, NULL),
(38211, 3260, 'Siero', NULL, NULL),
(38212, 3260, 'Tineo', NULL, NULL),
(38213, 3260, 'Valdes', NULL, NULL),
(38214, 3260, 'Villaviciosa', NULL, NULL),
(38215, 3261, 'Avila', NULL, NULL),
(38216, 3262, 'Almendralejo', NULL, NULL),
(38217, 3262, 'Azuaga', NULL, NULL),
(38218, 3262, 'Badajoz', NULL, NULL),
(38219, 3262, 'Don Benito', NULL, NULL),
(38220, 3262, 'Jerez de los Caballeros', NULL, NULL),
(38221, 3262, 'Merida', NULL, NULL),
(38222, 3262, 'Montijo', NULL, NULL),
(38223, 3262, 'Olivenza', NULL, NULL),
(38224, 3262, 'Villafranca de los Barros', NULL, NULL),
(38225, 3262, 'Villanueva de la Serena', NULL, NULL),
(38226, 3262, 'Zafra', NULL, NULL),
(38227, 3263, 'Alayor-Menorca', NULL, NULL),
(38228, 3263, 'Alcudia', NULL, NULL),
(38229, 3263, 'Calvia', NULL, NULL),
(38230, 3263, 'Capdepera', NULL, NULL),
(38231, 3263, 'Ciutadella de Menorca', NULL, NULL),
(38232, 3263, 'Eivissa', NULL, NULL),
(38233, 3263, 'Felanitx', NULL, NULL),
(38234, 3263, 'Inca', NULL, NULL),
(38235, 3263, 'Llucmajor', NULL, NULL),
(38236, 3263, 'Mahon', NULL, NULL),
(38237, 3263, 'Manacor', NULL, NULL),
(38238, 3263, 'Marratxi', NULL, NULL),
(38239, 3263, 'Palma', NULL, NULL),
(38240, 3263, 'Pollenca', NULL, NULL),
(38241, 3263, 'Sa Pobla', NULL, NULL),
(38242, 3263, 'Sant Antoni de Portmany', NULL, NULL),
(38243, 3263, 'Sant Josep de sa Talaia', NULL, NULL),
(38244, 3263, 'Santa Eulalia del Rio', NULL, NULL),
(38245, 3263, 'Santanyi', NULL, NULL),
(38246, 3263, 'Soller', NULL, NULL),
(38247, 3264, 'Abrera', NULL, NULL),
(38248, 3264, 'Alella', NULL, NULL),
(38249, 3264, 'Arenys de Mar', NULL, NULL),
(38250, 3264, 'Argentona', NULL, NULL),
(38251, 3264, 'Badalona', NULL, NULL),
(38252, 3264, 'Badia del Valles', NULL, NULL),
(38253, 3264, 'Barbera del Valles', NULL, NULL),
(38254, 3264, 'Barcelona', NULL, NULL),
(38255, 3264, 'Berga', NULL, NULL),
(38256, 3264, 'Cabrera de Mar', NULL, NULL),
(38257, 3264, 'Caldes de Montbui', NULL, NULL),
(38258, 3264, 'Calella', NULL, NULL),
(38259, 3264, 'Canet de Mar', NULL, NULL),
(38260, 3264, 'Canovelles', NULL, NULL),
(38261, 3264, 'Cardedeu', NULL, NULL),
(38262, 3264, 'Castellar del Valles', NULL, NULL),
(38263, 3264, 'Castellbisbal', NULL, NULL),
(38264, 3264, 'Castelldefels', NULL, NULL),
(38265, 3264, 'Cerdanyola', NULL, NULL),
(38266, 3264, 'Corbera de Llobregat', NULL, NULL),
(38267, 3264, 'Cornella', NULL, NULL),
(38268, 3264, 'El Masnou', NULL, NULL),
(38269, 3264, 'El Prat de Llobregat', NULL, NULL),
(38270, 3264, 'Esparreguera', NULL, NULL),
(38271, 3264, 'Esplugues de Llobregat', NULL, NULL),
(38272, 3264, 'Gava', NULL, NULL),
(38273, 3264, 'Granollers', NULL, NULL),
(38274, 3264, 'Igualada', NULL, NULL),
(38275, 3264, 'L\'\'Hospitalet de Llobregat', NULL, NULL),
(38276, 3264, 'La Garriga', NULL, NULL),
(38277, 3264, 'La Llagosta', NULL, NULL),
(38278, 3264, 'Les Franquesas del Valles', NULL, NULL),
(38279, 3264, 'Llica d\'\'Amunt', NULL, NULL),
(38280, 3264, 'Malgrat de Mar', NULL, NULL),
(38281, 3264, 'Manlleu', NULL, NULL),
(38282, 3264, 'Manresa', NULL, NULL),
(38283, 3264, 'Martorell', NULL, NULL),
(38284, 3264, 'Mataro', NULL, NULL),
(38285, 3264, 'Molins de Rei', NULL, NULL),
(38286, 3264, 'Mollet del Valles', NULL, NULL),
(38287, 3264, 'Montcada i Reixac', NULL, NULL),
(38288, 3264, 'Montgat', NULL, NULL),
(38289, 3264, 'Montmelo', NULL, NULL),
(38290, 3264, 'Montornes del Valles', NULL, NULL),
(38291, 3264, 'Olesa de Montserrat', NULL, NULL),
(38292, 3264, 'Palau-solita i Plegamans', NULL, NULL),
(38293, 3264, 'Palleja', NULL, NULL),
(38294, 3264, 'Parets del Valles', NULL, NULL),
(38295, 3264, 'Piera', NULL, NULL),
(38296, 3264, 'Pineda de Mar', NULL, NULL),
(38297, 3264, 'Premia de Dalt', NULL, NULL),
(38298, 3264, 'Premia de Mar', NULL, NULL),
(38299, 3264, 'Ripollet', NULL, NULL),
(38300, 3264, 'Rubi', NULL, NULL),
(38301, 3264, 'Sabadell', NULL, NULL),
(38302, 3264, 'Sant Adria de Besos', NULL, NULL),
(38303, 3264, 'Sant Andreu de la Barca', NULL, NULL),
(38304, 3264, 'Sant Boi de Llobregat', NULL, NULL),
(38305, 3264, 'Sant Celoni', NULL, NULL),
(38306, 3264, 'Sant Cugat del Valles', NULL, NULL),
(38307, 3264, 'Sant Feliu de Llobregat', NULL, NULL),
(38308, 3264, 'Sant Joan Despi', NULL, NULL),
(38309, 3264, 'Sant Joan de Vilatorrada', NULL, NULL),
(38310, 3264, 'Sant Just Desvern', NULL, NULL),
(38311, 3264, 'Sant Pere de Ribes', NULL, NULL),
(38312, 3264, 'Sant Quirze del Valles', NULL, NULL),
(38313, 3264, 'Sant Sadurni d\'\'Anoia', NULL, NULL),
(38314, 3264, 'Sant Vicenc dels Horts', NULL, NULL),
(38315, 3264, 'Santa Coloma de Gramenet', NULL, NULL),
(38316, 3264, 'Santa Margarida de Montbui', NULL, NULL),
(38317, 3264, 'Santa Perpetua de Mogoda', NULL, NULL),
(38318, 3264, 'Sitges', NULL, NULL),
(38319, 3264, 'Son Servera', NULL, NULL),
(38320, 3264, 'Terrassa', NULL, NULL),
(38321, 3264, 'Tordera', NULL, NULL),
(38322, 3264, 'Torello', NULL, NULL),
(38323, 3264, 'Vallirana', NULL, NULL),
(38324, 3264, 'Vic', NULL, NULL),
(38325, 3264, 'Viladecans', NULL, NULL),
(38326, 3264, 'Viladecavalls', NULL, NULL),
(38327, 3264, 'Vilafranca del Penedes', NULL, NULL),
(38328, 3264, 'Vilanova del Cami', NULL, NULL),
(38329, 3264, 'Vilanova i la Geltru', NULL, NULL),
(38330, 3264, 'Vilassar del Mar', NULL, NULL),
(38331, 3265, 'Bertamirans', NULL, NULL),
(38332, 3266, 'Berriatua', NULL, NULL),
(38333, 3266, 'Derio', NULL, NULL),
(38334, 3266, 'Elorio', NULL, NULL),
(38335, 3266, 'Loiu', NULL, NULL),
(38336, 3267, 'Aranda de Duero', NULL, NULL),
(38337, 3267, 'Burgos', NULL, NULL),
(38338, 3267, 'Miranda de Ebro', NULL, NULL),
(38339, 3268, 'Caceres', NULL, NULL),
(38340, 3268, 'Coria', NULL, NULL),
(38341, 3268, 'Miajadas', NULL, NULL),
(38342, 3268, 'Navalmoral de la Mata', NULL, NULL),
(38343, 3268, 'Plasencia', NULL, NULL),
(38344, 3268, 'Talayuela', NULL, NULL),
(38345, 3268, 'Trujillo', NULL, NULL),
(38346, 3269, 'Algeciras', NULL, NULL),
(38347, 3269, 'Arcos de la Frontera', NULL, NULL),
(38348, 3269, 'Barbate', NULL, NULL),
(38349, 3269, 'Cadiz', NULL, NULL),
(38350, 3269, 'Chiclana', NULL, NULL),
(38351, 3269, 'Chipiona', NULL, NULL),
(38352, 3269, 'Conil', NULL, NULL),
(38353, 3269, 'El Puerto de Santa Maria', NULL, NULL),
(38354, 3269, 'Jerez', NULL, NULL),
(38355, 3269, 'Jimena de la Frontera', NULL, NULL),
(38356, 3269, 'La Linea', NULL, NULL),
(38357, 3269, 'Los Barrios', NULL, NULL),
(38358, 3269, 'Medina-Sidonia', NULL, NULL),
(38359, 3269, 'Olvera', NULL, NULL),
(38360, 3269, 'Puerto Real', NULL, NULL),
(38361, 3269, 'Rota', NULL, NULL),
(38362, 3269, 'San Fernando', NULL, NULL),
(38363, 3269, 'San Roque', NULL, NULL),
(38364, 3269, 'Sanlucar de Barrameda', NULL, NULL),
(38365, 3269, 'Tarifa', NULL, NULL),
(38366, 3269, 'Ubrique', NULL, NULL),
(38367, 3269, 'Vejer de la Frontera', NULL, NULL),
(38368, 3269, 'Villamartin', NULL, NULL),
(38369, 3270, 'Camargo', NULL, NULL),
(38370, 3270, 'Castro-Urdiales', NULL, NULL),
(38371, 3270, 'El Astillero', NULL, NULL),
(38372, 3270, 'Laredo', NULL, NULL),
(38373, 3270, 'Los Corrales de Buelna', NULL, NULL),
(38374, 3270, 'Pielagos', NULL, NULL),
(38375, 3270, 'Reinosa', NULL, NULL),
(38376, 3270, 'San Felices De Buelna', NULL, NULL),
(38377, 3270, 'Santa Cruz de Bezana', NULL, NULL),
(38378, 3270, 'Santander', NULL, NULL),
(38379, 3270, 'Santona', NULL, NULL),
(38380, 3270, 'Torrelavega', NULL, NULL),
(38381, 3271, 'Almassora', NULL, NULL),
(38382, 3271, 'Benicarlo', NULL, NULL),
(38383, 3271, 'Benicassim', NULL, NULL),
(38384, 3271, 'Burriana', NULL, NULL),
(38385, 3271, 'Castello', NULL, NULL),
(38386, 3271, 'L\'\'Alcora', NULL, NULL),
(38387, 3271, 'La Vall d\'\'Uixo', NULL, NULL),
(38388, 3271, 'Nules', NULL, NULL),
(38389, 3271, 'Onda', NULL, NULL),
(38390, 3271, 'Segorbe', NULL, NULL),
(38391, 3271, 'Vila-real', NULL, NULL),
(38392, 3271, 'Vinaros', NULL, NULL),
(38393, 3272, 'Barcelona', NULL, NULL),
(38394, 3273, 'Ceuta', NULL, NULL),
(38395, 3281, 'Aguilar de la Frontera', NULL, NULL),
(38396, 3281, 'Baena', NULL, NULL),
(38397, 3281, 'Bujalance', NULL, NULL),
(38398, 3281, 'Cabra', NULL, NULL),
(38399, 3281, 'Cordoba', NULL, NULL),
(38400, 3281, 'Fernan-Nunez', NULL, NULL),
(38401, 3281, 'Fuente Palmera', NULL, NULL),
(38402, 3281, 'La Carlota', NULL, NULL),
(38403, 3281, 'Lucena', NULL, NULL),
(38404, 3281, 'Luque', NULL, NULL),
(38405, 3281, 'Montilla', NULL, NULL),
(38406, 3281, 'Montoro', NULL, NULL),
(38407, 3281, 'Palma del Rio', NULL, NULL),
(38408, 3281, 'Penarroya-Pueblonuevo', NULL, NULL),
(38409, 3281, 'Pozoblanco', NULL, NULL),
(38410, 3281, 'Priego de Cordoba', NULL, NULL),
(38411, 3281, 'Puente Genil', NULL, NULL),
(38412, 3281, 'Rute', NULL, NULL),
(38413, 3281, 'Villanueva de Cordoba', NULL, NULL),
(38414, 3282, 'Cuenca', NULL, NULL),
(38415, 3282, 'Tarancon', NULL, NULL),
(38416, 3283, 'Aduna', NULL, NULL),
(38417, 3283, 'Lazakao', NULL, NULL),
(38418, 3284, 'Banyoles', NULL, NULL),
(38419, 3284, 'Blanes', NULL, NULL),
(38420, 3284, 'Empuriabrava', NULL, NULL),
(38421, 3284, 'Figueres', NULL, NULL),
(38422, 3284, 'Girona', NULL, NULL),
(38423, 3284, 'La Bisbal d\'\'Emporda', NULL, NULL),
(38424, 3284, 'Lloret de Mar', NULL, NULL),
(38425, 3284, 'Massanet de la Selva', NULL, NULL),
(38426, 3284, 'Olot', NULL, NULL),
(38427, 3284, 'Palafrugell', NULL, NULL),
(38428, 3284, 'Palamos', NULL, NULL),
(38429, 3284, 'Ripoll', NULL, NULL),
(38430, 3284, 'Roses', NULL, NULL),
(38431, 3284, 'Salt', NULL, NULL),
(38432, 3284, 'Sant Feliu de Guixols', NULL, NULL),
(38433, 3284, 'Santa Coloma de Farners', NULL, NULL),
(38434, 3284, 'Torroella de Montgri', NULL, NULL),
(38435, 3285, 'Albolote', NULL, NULL),
(38436, 3285, 'Almunecar', NULL, NULL),
(38437, 3285, 'Armilla', NULL, NULL),
(38438, 3285, 'Atarfe', NULL, NULL),
(38439, 3285, 'Baza', NULL, NULL),
(38440, 3285, 'Granada', NULL, NULL),
(38441, 3285, 'Guadix', NULL, NULL),
(38442, 3285, 'Huescar', NULL, NULL),
(38443, 3285, 'Huetor Tajar', NULL, NULL),
(38444, 3285, 'Huetor Vega', NULL, NULL),
(38445, 3285, 'Illora', NULL, NULL),
(38446, 3285, 'La Zubia', NULL, NULL),
(38447, 3285, 'Las Gabias', NULL, NULL),
(38448, 3285, 'Loja', NULL, NULL),
(38449, 3285, 'Maracena', NULL, NULL),
(38450, 3285, 'Motril', NULL, NULL),
(38451, 3285, 'Ogijares', NULL, NULL),
(38452, 3285, 'Peligros', NULL, NULL),
(38453, 3285, 'Pinos Puente', NULL, NULL),
(38454, 3285, 'Salobrena', NULL, NULL),
(38455, 3285, 'Santa Fe', NULL, NULL),
(38456, 3286, 'Azuqueca de Henares', NULL, NULL),
(38457, 3286, 'Guadalajara', NULL, NULL),
(38458, 3287, 'Andoain', NULL, NULL),
(38459, 3287, 'Anoeta', NULL, NULL),
(38460, 3287, 'Arrasate', NULL, NULL),
(38461, 3287, 'Azkoitia', NULL, NULL),
(38462, 3287, 'Azpeitia', NULL, NULL),
(38463, 3287, 'Beasain', NULL, NULL),
(38464, 3287, 'Bergara', NULL, NULL),
(38465, 3287, 'Donostia', NULL, NULL),
(38466, 3287, 'Eibar', NULL, NULL),
(38467, 3287, 'Elgoibar', NULL, NULL),
(38468, 3287, 'Errenteria', NULL, NULL),
(38469, 3287, 'Guipuuzcoa', NULL, NULL),
(38470, 3287, 'Hernani', NULL, NULL),
(38471, 3287, 'Hondarribia', NULL, NULL),
(38472, 3287, 'Irun', NULL, NULL),
(38473, 3287, 'Legazpi', NULL, NULL),
(38474, 3287, 'Mendaro', NULL, NULL),
(38475, 3287, 'Mondragon', NULL, NULL),
(38476, 3287, 'Oiartzun', NULL, NULL),
(38477, 3287, 'Onati', NULL, NULL),
(38478, 3287, 'Ordizia', NULL, NULL),
(38479, 3287, 'Oria', NULL, NULL),
(38480, 3287, 'Pasaia', NULL, NULL),
(38481, 3287, 'Tolosa', NULL, NULL),
(38482, 3287, 'Zarautz', NULL, NULL),
(38483, 3287, 'Zumaia', NULL, NULL),
(38484, 3287, 'Zumarraga', NULL, NULL),
(38485, 3288, 'Aljaraque', NULL, NULL),
(38486, 3288, 'Almonte', NULL, NULL),
(38487, 3288, 'Ayamonte', NULL, NULL),
(38488, 3288, 'Bollullos Par del Condado', NULL, NULL),
(38489, 3288, 'Cartaya', NULL, NULL),
(38490, 3288, 'Gibraleon', NULL, NULL),
(38491, 3288, 'Huelva', NULL, NULL),
(38492, 3288, 'Isla Cristina', NULL, NULL),
(38493, 3288, 'La Palma del Condado', NULL, NULL),
(38494, 3288, 'Lepe', NULL, NULL),
(38495, 3288, 'Moguer', NULL, NULL),
(38496, 3288, 'Punta Umbria', NULL, NULL),
(38497, 3288, 'Valverde del Camino', NULL, NULL),
(38498, 3289, 'Barbastro', NULL, NULL),
(38499, 3289, 'Binefar', NULL, NULL),
(38500, 3289, 'Fraga', NULL, NULL),
(38501, 3289, 'Huesca', NULL, NULL),
(38502, 3289, 'Jaca', NULL, NULL),
(38503, 3289, 'Monzon', NULL, NULL),
(38504, 3289, 'Sabinanigo', NULL, NULL),
(38505, 3290, 'Alcala la Real', NULL, NULL),
(38506, 3290, 'Alcaudete', NULL, NULL),
(38507, 3290, 'Andujar', NULL, NULL),
(38508, 3290, 'Baeza', NULL, NULL),
(38509, 3290, 'Bailen', NULL, NULL),
(38510, 3290, 'Cazorla', NULL, NULL),
(38511, 3290, 'Jaen', NULL, NULL),
(38512, 3290, 'Jodar', NULL, NULL),
(38513, 3290, 'La Carolina', NULL, NULL),
(38514, 3290, 'Linares', NULL, NULL),
(38515, 3290, 'Mancha Real', NULL, NULL),
(38516, 3290, 'Martos', NULL, NULL),
(38517, 3290, 'Mengibar', NULL, NULL),
(38518, 3290, 'Torre del Campo', NULL, NULL),
(38519, 3290, 'Torredonjimeno', NULL, NULL),
(38520, 3290, 'Ubeda', NULL, NULL),
(38521, 3290, 'Villacarrillo', NULL, NULL),
(38522, 3290, 'Villanueva del Arzobispo', NULL, NULL),
(38523, 3293, 'Astorga', NULL, NULL),
(38524, 3293, 'Bembibre', NULL, NULL),
(38525, 3293, 'La Baneza', NULL, NULL),
(38526, 3293, 'Leon', NULL, NULL),
(38527, 3293, 'Ponferrada', NULL, NULL),
(38528, 3293, 'San Andres del Rabanedo', NULL, NULL),
(38529, 3293, 'Villablino', NULL, NULL),
(38530, 3293, 'Villaquilambre', NULL, NULL),
(38531, 3294, 'Tora', NULL, NULL),
(38532, 3295, 'Balaguer', NULL, NULL),
(38533, 3295, 'La Seu d\'\'Urgell', NULL, NULL),
(38534, 3295, 'Lleida', NULL, NULL),
(38535, 3295, 'Mollerussa', NULL, NULL),
(38536, 3295, 'Tarrega', NULL, NULL),
(38537, 3296, 'Burela', NULL, NULL),
(38538, 3296, 'Cervo', NULL, NULL),
(38539, 3296, 'Chantada', NULL, NULL),
(38540, 3296, 'Foz', NULL, NULL),
(38541, 3296, 'Lugo', NULL, NULL),
(38542, 3296, 'Monforte de Lemos', NULL, NULL),
(38543, 3296, 'Ribadeo', NULL, NULL),
(38544, 3296, 'Sarria', NULL, NULL),
(38545, 3296, 'Vilalba', NULL, NULL),
(38546, 3296, 'Viveiro', NULL, NULL),
(38547, 3297, 'Alcala de Henares', NULL, NULL),
(38548, 3297, 'Alcobendas', NULL, NULL),
(38549, 3297, 'Alcorcon', NULL, NULL),
(38550, 3297, 'Algete', NULL, NULL),
(38551, 3297, 'Alpedrete', NULL, NULL),
(38552, 3297, 'Aranjuez', NULL, NULL),
(38553, 3297, 'Arganda del Rey', NULL, NULL),
(38554, 3297, 'Boadilla del Monte', NULL, NULL),
(38555, 3297, 'Ciempozuelos', NULL, NULL),
(38556, 3297, 'Collado Villalba', NULL, NULL),
(38557, 3297, 'Colmenar Viejo', NULL, NULL),
(38558, 3297, 'Coslada', NULL, NULL),
(38559, 3297, 'El Escorial', NULL, NULL),
(38560, 3297, 'Fuenlabrada', NULL, NULL),
(38561, 3297, 'Galapagar', NULL, NULL),
(38562, 3297, 'Getafe', NULL, NULL),
(38563, 3297, 'Guadarrama', NULL, NULL),
(38564, 3297, 'Humanes de Madrid', NULL, NULL),
(38565, 3297, 'Las Rozas de Madrid', NULL, NULL),
(38566, 3297, 'Leganes', NULL, NULL),
(38567, 3297, 'Madrid', NULL, NULL),
(38568, 3297, 'Majadahonda', NULL, NULL),
(38569, 3297, 'Meco', NULL, NULL),
(38570, 3297, 'Mejorada del Campo', NULL, NULL),
(38571, 3297, 'Mostoles', NULL, NULL),
(38572, 3297, 'Navalcarnero', NULL, NULL),
(38573, 3297, 'Parla', NULL, NULL),
(38574, 3297, 'Pinto', NULL, NULL),
(38575, 3297, 'Pozuelo de Alarcon', NULL, NULL),
(38576, 3297, 'Rivas-Vaciamadrid', NULL, NULL),
(38577, 3297, 'San Fernando de Henares', NULL, NULL),
(38578, 3297, 'San Lorenzo de El Escorial', NULL, NULL),
(38579, 3297, 'San Martin de la Vega', NULL, NULL),
(38580, 3297, 'San Sebastian de los Reyes', NULL, NULL),
(38581, 3297, 'Torrejon de Ardoz', NULL, NULL),
(38582, 3297, 'Torrelodones', NULL, NULL),
(38583, 3297, 'Tres Cantos', NULL, NULL),
(38584, 3297, 'Valdemoro', NULL, NULL),
(38585, 3297, 'Velilla de San Antonio', NULL, NULL),
(38586, 3297, 'Villanueva de la Canada', NULL, NULL),
(38587, 3297, 'Villaviciosa de Odon', NULL, NULL),
(38588, 3298, 'Alhaurin de la Torre', NULL, NULL),
(38589, 3298, 'Alhaurin el Grande', NULL, NULL),
(38590, 3298, 'Alora', NULL, NULL),
(38591, 3298, 'Antequera', NULL, NULL),
(38592, 3298, 'Apartado', NULL, NULL),
(38593, 3298, 'Archidona', NULL, NULL),
(38594, 3298, 'Benalmadena', NULL, NULL),
(38595, 3298, 'Cartama', NULL, NULL),
(38596, 3298, 'Coin', NULL, NULL),
(38597, 3298, 'Estepona', NULL, NULL),
(38598, 3298, 'Fuengirola', NULL, NULL),
(38599, 3298, 'Malaga', NULL, NULL),
(38600, 3298, 'Marbella', NULL, NULL),
(38601, 3298, 'Mijas', NULL, NULL),
(38602, 3298, 'Nerja', NULL, NULL),
(38603, 3298, 'Rincon de la Victoria', NULL, NULL),
(38604, 3298, 'Ronda', NULL, NULL),
(38605, 3298, 'Torremolinos', NULL, NULL),
(38606, 3298, 'Torrox', NULL, NULL),
(38607, 3298, 'Velez-Malaga', NULL, NULL),
(38608, 3298, 'maro', NULL, NULL),
(38609, 3299, 'Melilla', NULL, NULL),
(38610, 3300, 'Abaran', NULL, NULL),
(38611, 3300, 'Aguilas', NULL, NULL),
(38612, 3300, 'Alcantarilla', NULL, NULL),
(38613, 3300, 'Alhama de Murcia', NULL, NULL),
(38614, 3300, 'Archena', NULL, NULL),
(38615, 3300, 'Beniel', NULL, NULL),
(38616, 3300, 'Bullas', NULL, NULL),
(38617, 3300, 'Calasparra', NULL, NULL),
(38618, 3300, 'Caravaca de la Cruz', NULL, NULL),
(38619, 3300, 'Cartagena', NULL, NULL),
(38620, 3300, 'Cehegin', NULL, NULL),
(38621, 3300, 'Cieza', NULL, NULL),
(38622, 3300, 'Fuente Alamo de Murcia', NULL, NULL),
(38623, 3300, 'Jumilla', NULL, NULL),
(38624, 3300, 'La Union', NULL, NULL),
(38625, 3300, 'Las Torres de Cotillas', NULL, NULL),
(38626, 3300, 'Lorca', NULL, NULL),
(38627, 3300, 'Los Alcazares', NULL, NULL),
(38628, 3300, 'Mazarron', NULL, NULL),
(38629, 3300, 'Molina de Segura', NULL, NULL),
(38630, 3300, 'Moratella', NULL, NULL),
(38631, 3300, 'Mula', NULL, NULL),
(38632, 3300, 'Murcia', NULL, NULL),
(38633, 3300, 'Puerto Lumbreras', NULL, NULL),
(38634, 3300, 'San Javier', NULL, NULL),
(38635, 3300, 'San Pedro del Pinatar', NULL, NULL),
(38636, 3300, 'Santomera', NULL, NULL),
(38637, 3300, 'Torre Pacheco', NULL, NULL),
(38638, 3300, 'Torre-Pacheco', NULL, NULL),
(38639, 3300, 'Totana', NULL, NULL),
(38640, 3300, 'Yecla', NULL, NULL),
(38641, 3301, 'Ansoain', NULL, NULL),
(38642, 3301, 'Atarrabia', NULL, NULL),
(38643, 3301, 'Baranain', NULL, NULL),
(38644, 3301, 'Burlata', NULL, NULL),
(38645, 3301, 'Iruna', NULL, NULL),
(38646, 3301, 'Lizarra', NULL, NULL),
(38647, 3301, 'Navarra', NULL, NULL),
(38648, 3301, 'Orkoien', NULL, NULL),
(38649, 3301, 'Tafalla', NULL, NULL),
(38650, 3301, 'Tudela', NULL, NULL),
(38651, 3301, 'Zizur Nagusia', NULL, NULL),
(38652, 3302, 'O Barco de Valdeorras', NULL, NULL),
(38653, 3302, 'O Carballino', NULL, NULL),
(38654, 3302, 'Ourense', NULL, NULL),
(38655, 3302, 'Verin', NULL, NULL),
(38656, 3302, 'Xinzo de Limia', NULL, NULL),
(38657, 3304, 'Guardo', NULL, NULL),
(38658, 3304, 'Palencia', NULL, NULL),
(38659, 3305, 'A Estrada', NULL, NULL),
(38660, 3305, 'A Guarda', NULL, NULL),
(38661, 3305, 'Baiona', NULL, NULL),
(38662, 3305, 'Bueu', NULL, NULL),
(38663, 3305, 'Caldas de Reis', NULL, NULL),
(38664, 3305, 'Cambados', NULL, NULL),
(38665, 3305, 'Cangas', NULL, NULL),
(38666, 3305, 'Cangas De Morrazo', NULL, NULL),
(38667, 3305, 'Gondomar', NULL, NULL),
(38668, 3305, 'Lalin', NULL, NULL),
(38669, 3305, 'Marin', NULL, NULL),
(38670, 3305, 'Moana', NULL, NULL),
(38671, 3305, 'Mos', NULL, NULL),
(38672, 3305, 'Nigran', NULL, NULL),
(38673, 3305, 'O Grove', NULL, NULL),
(38674, 3305, 'O Porrino', NULL, NULL),
(38675, 3305, 'Poio', NULL, NULL),
(38676, 3305, 'Ponteareas', NULL, NULL),
(38677, 3305, 'Pontevedra', NULL, NULL),
(38678, 3305, 'Redondela', NULL, NULL),
(38679, 3305, 'Salvaterra de Mino', NULL, NULL),
(38680, 3305, 'Sanxenxo', NULL, NULL),
(38681, 3305, 'Silleda', NULL, NULL),
(38682, 3305, 'Tomino', NULL, NULL),
(38683, 3305, 'Tui', NULL, NULL),
(38684, 3305, 'Vigo', NULL, NULL),
(38685, 3305, 'Vilagarcia de Arousa', NULL, NULL),
(38686, 3305, 'Vilanova de Arousa', NULL, NULL),
(38687, 3306, 'Bejar', NULL, NULL),
(38688, 3306, 'Ciudad Rodrigo', NULL, NULL),
(38689, 3306, 'Salamanca', NULL, NULL),
(38690, 3306, 'Santa Marta de Tormes', NULL, NULL),
(38691, 3308, 'Cuellar', NULL, NULL),
(38692, 3308, 'Segovia', NULL, NULL),
(38693, 3309, 'Alcala de Guadaira', NULL, NULL),
(38694, 3309, 'Alcala del Rio', NULL, NULL),
(38695, 3309, 'Arahal', NULL, NULL),
(38696, 3309, 'Bormujos', NULL, NULL),
(38697, 3309, 'Brenes', NULL, NULL),
(38698, 3309, 'Camas', NULL, NULL),
(38699, 3309, 'Cantillana', NULL, NULL),
(38700, 3309, 'Carmona', NULL, NULL),
(38701, 3309, 'Castilleja de la Cuesta', NULL, NULL),
(38702, 3309, 'Coria del Rio', NULL, NULL),
(38703, 3309, 'Dos Hermanas', NULL, NULL),
(38704, 3309, 'Ecija', NULL, NULL),
(38705, 3309, 'El Viso del Alcor', NULL, NULL),
(38706, 3309, 'Estepa', NULL, NULL),
(38707, 3309, 'Gines', NULL, NULL),
(38708, 3309, 'Guillena', NULL, NULL),
(38709, 3309, 'La Algaba', NULL, NULL),
(38710, 3309, 'La Puebla de Cazalla', NULL, NULL),
(38711, 3309, 'La Puebla del Rio', NULL, NULL),
(38712, 3309, 'La Rinconada', NULL, NULL),
(38713, 3309, 'Las Cabezas de San Juan', NULL, NULL),
(38714, 3309, 'Lebrija', NULL, NULL),
(38715, 3309, 'Lora del Rio', NULL, NULL),
(38716, 3309, 'Los Palacios y Villafranca', NULL, NULL),
(38717, 3309, 'Mairena del Alcor', NULL, NULL),
(38718, 3309, 'Mairena del Aljarafe', NULL, NULL),
(38719, 3309, 'Marchena', NULL, NULL),
(38720, 3309, 'Moron de la Frontera', NULL, NULL),
(38721, 3309, 'Olivares', NULL, NULL),
(38722, 3309, 'Osuna', NULL, NULL),
(38723, 3309, 'Pilas', NULL, NULL),
(38724, 3309, 'San Juan de Aznalfarache', NULL, NULL),
(38725, 3309, 'Sanlucar la Mayor', NULL, NULL),
(38726, 3309, 'Sevilla', NULL, NULL),
(38727, 3309, 'Tocina', NULL, NULL),
(38728, 3309, 'Tomares', NULL, NULL),
(38729, 3309, 'Utrera', NULL, NULL),
(38730, 3310, 'Soria', NULL, NULL),
(38731, 3311, 'Alcanar', NULL, NULL),
(38732, 3311, 'Amposta', NULL, NULL),
(38733, 3311, 'Calafell', NULL, NULL),
(38734, 3311, 'Cambrils', NULL, NULL),
(38735, 3311, 'Deltrebe', NULL, NULL),
(38736, 3311, 'El Vendrell', NULL, NULL),
(38737, 3311, 'Reus', NULL, NULL),
(38738, 3311, 'Salou', NULL, NULL),
(38739, 3311, 'Sant Carles de la Rapita', NULL, NULL),
(38740, 3311, 'Tarragona', NULL, NULL),
(38741, 3311, 'Torredembarra', NULL, NULL),
(38742, 3311, 'Tortosa', NULL, NULL),
(38743, 3311, 'Valls', NULL, NULL),
(38744, 3311, 'Vila-seca', NULL, NULL),
(38745, 3312, 'Tenerife', NULL, NULL),
(38746, 3313, 'Alcaniz', NULL, NULL),
(38747, 3313, 'Teruel', NULL, NULL),
(38748, 3314, 'Consuegra', NULL, NULL),
(38749, 3314, 'Illescas', NULL, NULL),
(38750, 3314, 'Madridejos', NULL, NULL),
(38751, 3314, 'Mora', NULL, NULL),
(38752, 3314, 'Pepino', NULL, NULL),
(38753, 3314, 'Quintanar de la Orden', NULL, NULL),
(38754, 3314, 'Sonseca', NULL, NULL),
(38755, 3314, 'Talavera de la Reina', NULL, NULL),
(38756, 3314, 'Toledo', NULL, NULL),
(38757, 3314, 'Torrijos', NULL, NULL),
(38758, 3314, 'Villacanas', NULL, NULL),
(38759, 3315, 'Agullent', NULL, NULL),
(38760, 3315, 'Alaquas', NULL, NULL),
(38761, 3315, 'Albal', NULL, NULL),
(38762, 3315, 'Alberic', NULL, NULL),
(38763, 3315, 'Alboraya', NULL, NULL),
(38764, 3315, 'Aldaia', NULL, NULL),
(38765, 3315, 'Alfafar', NULL, NULL),
(38766, 3315, 'Algemesi', NULL, NULL),
(38767, 3315, 'Alginet', NULL, NULL),
(38768, 3315, 'Alzira', NULL, NULL),
(38769, 3315, 'Benaguasil', NULL, NULL),
(38770, 3315, 'Benetusser', NULL, NULL),
(38771, 3315, 'Benifaio', NULL, NULL),
(38772, 3315, 'Beniparrell', NULL, NULL),
(38773, 3315, 'Betera', NULL, NULL),
(38774, 3315, 'Bunol', NULL, NULL),
(38775, 3315, 'Burjassot', NULL, NULL),
(38776, 3315, 'Canals', NULL, NULL),
(38777, 3315, 'Carcaixent', NULL, NULL),
(38778, 3315, 'Carlet', NULL, NULL),
(38779, 3315, 'Catarroja', NULL, NULL),
(38780, 3315, 'Chiva', NULL, NULL),
(38781, 3315, 'Cullera', NULL, NULL),
(38782, 3315, 'Elche', NULL, NULL),
(38783, 3315, 'Gandia', NULL, NULL),
(38784, 3315, 'Godella', NULL, NULL),
(38785, 3315, 'L\'\'Alcudia', NULL, NULL),
(38786, 3315, 'L\'\'Eliana', NULL, NULL),
(38787, 3315, 'La Pobla de Vallbona', NULL, NULL),
(38788, 3315, 'Lliria', NULL, NULL),
(38789, 3315, 'Los Montesinos', NULL, NULL),
(38790, 3315, 'Manises', NULL, NULL),
(38791, 3315, 'Massamagrell', NULL, NULL),
(38792, 3315, 'Meliana', NULL, NULL),
(38793, 3315, 'Mislata', NULL, NULL),
(38794, 3315, 'Moncada', NULL, NULL),
(38795, 3315, 'Oliva', NULL, NULL),
(38796, 3315, 'Ontinyent', NULL, NULL),
(38797, 3315, 'Paiporta', NULL, NULL),
(38798, 3315, 'Paterna', NULL, NULL),
(38799, 3315, 'Picanya', NULL, NULL),
(38800, 3315, 'Picassent', NULL, NULL),
(38801, 3315, 'Pucol', NULL, NULL),
(38802, 3315, 'Quart de Poblet', NULL, NULL),
(38803, 3315, 'Requena', NULL, NULL),
(38804, 3315, 'Riba-roja de Turia', NULL, NULL),
(38805, 3315, 'Sagunt', NULL, NULL),
(38806, 3315, 'Sedavi', NULL, NULL),
(38807, 3315, 'Silla', NULL, NULL),
(38808, 3315, 'Sueca', NULL, NULL),
(38809, 3315, 'Tavernes Blanques', NULL, NULL),
(38810, 3315, 'Tavernes de la Valldigna', NULL, NULL),
(38811, 3315, 'Torrent', NULL, NULL),
(38812, 3315, 'Utiel', NULL, NULL),
(38813, 3315, 'Valencia', NULL, NULL),
(38814, 3315, 'Xativa', NULL, NULL),
(38815, 3315, 'Xirivella', NULL, NULL),
(38816, 3316, 'Laguna de Duero', NULL, NULL),
(38817, 3316, 'Medina del Campo', NULL, NULL),
(38818, 3316, 'Tordesillas', NULL, NULL),
(38819, 3316, 'Valladolid', NULL, NULL),
(38820, 3317, 'Abadiano', NULL, NULL),
(38821, 3317, 'Abanto Zierbena', NULL, NULL),
(38822, 3317, 'Amorebieta', NULL, NULL),
(38823, 3317, 'Arrigorriaga', NULL, NULL),
(38824, 3317, 'Barakaldo', NULL, NULL),
(38825, 3317, 'Basauri', NULL, NULL),
(38826, 3317, 'Bermeo', NULL, NULL),
(38827, 3317, 'Berriz', NULL, NULL),
(38828, 3317, 'Bilbao', NULL, NULL),
(38829, 3317, 'Durango', NULL, NULL),
(38830, 3317, 'Erandio', NULL, NULL),
(38831, 3317, 'Ermua', NULL, NULL),
(38832, 3317, 'Etxano', NULL, NULL),
(38833, 3317, 'Galdakao', NULL, NULL),
(38834, 3317, 'Gernika-Lumo', NULL, NULL),
(38835, 3317, 'Getxo', NULL, NULL),
(38836, 3317, 'Igorre', NULL, NULL),
(38837, 3317, 'Leioa', NULL, NULL),
(38838, 3317, 'Mungia', NULL, NULL),
(38839, 3317, 'Ondarroa', NULL, NULL),
(38840, 3317, 'Ortuella', NULL, NULL),
(38841, 3317, 'Portugalete', NULL, NULL),
(38842, 3317, 'Santurtzi', NULL, NULL),
(38843, 3317, 'Sestao', NULL, NULL),
(38844, 3317, 'Sopelana', NULL, NULL),
(38845, 3317, 'Trapagaran', NULL, NULL),
(38846, 3317, 'Zamudio', NULL, NULL),
(38847, 3318, 'Benavente', NULL, NULL),
(38848, 3318, 'Toro', NULL, NULL),
(38849, 3318, 'Zamora', NULL, NULL),
(38850, 3319, 'Calatayud', NULL, NULL),
(38851, 3319, 'Ejea de los Caballeros', NULL, NULL),
(38852, 3319, 'Tarazona', NULL, NULL),
(38853, 3319, 'Utebo', NULL, NULL),
(38854, 3319, 'Zaragoza', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cms_services`
--

CREATE TABLE `cms_services` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cms_services`
--

INSERT INTO `cms_services` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'home_title', 'SocoJobs', '2022-10-04 06:43:43', '2023-01-30 14:26:52'),
(2, 'home_description', 'SocoJobs', '2022-10-04 06:43:43', '2023-01-30 14:26:52'),
(3, 'home_banner', 'front_web/images/hero-img.png', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(4, 'about_title_one', 'Registrese', '2022-10-04 06:43:43', '2023-01-30 15:19:30'),
(5, 'about_description_one', 'Registrese Registrese Registrese Registrese Registrese', '2022-10-04 06:43:43', '2023-01-30 15:19:30'),
(6, 'about_image_one', 'front_web/images/register.png', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(7, 'about_title_two', 'Presente su oferta', '2022-10-04 06:43:43', '2023-01-30 15:19:30'),
(8, 'about_description_two', 'Presente su oferta Presente su oferta Presente su oferta Presente su oferta Presente su oferta', '2022-10-04 06:43:43', '2023-01-30 15:19:30'),
(9, 'about_image_two', 'front_web/images/resume.png', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(10, 'about_title_three', 'Comenzar a trabajar', '2022-10-04 06:43:43', '2023-01-30 15:19:30'),
(11, 'about_description_three', 'Comenzar a trabajar Comenzar a trabajar Comenzar a trabajar Comenzar a trabajar Comenzar a trabajar', '2022-10-04 06:43:43', '2023-01-30 15:19:31'),
(12, 'about_image_three', 'front_web/images/working.png', '2022-10-04 06:43:43', '2022-10-04 06:43:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `companies`
--

CREATE TABLE `companies` (
  `id` int(10) UNSIGNED NOT NULL,
  `ceo` varchar(191) DEFAULT NULL,
  `no_of_offices` int(11) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `industry_id` int(10) UNSIGNED DEFAULT NULL,
  `ownership_type_id` int(10) UNSIGNED DEFAULT NULL,
  `company_size_id` int(10) UNSIGNED DEFAULT NULL,
  `established_in` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `website` varchar(191) DEFAULT NULL,
  `location` varchar(191) DEFAULT NULL,
  `location2` varchar(191) DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `fax` varchar(191) DEFAULT NULL,
  `unique_id` varchar(170) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `last_change` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `company_sizes`
--

CREATE TABLE `company_sizes` (
  `id` int(10) UNSIGNED NOT NULL,
  `size` varchar(170) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `company_sizes`
--

INSERT INTO `company_sizes` (`id`, `size`, `created_at`, `updated_at`, `is_default`) VALUES
(1, '5-10', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `countries`
--

CREATE TABLE `countries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `short_code` varchar(191) NOT NULL,
  `phone_code` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `countries`
--

INSERT INTO `countries` (`id`, `name`, `short_code`, `phone_code`, `created_at`, `updated_at`) VALUES
(205, 'España', 'ES', '34', NULL, '2023-01-30 14:28:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `email_jobs`
--

CREATE TABLE `email_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `job_id` int(10) UNSIGNED NOT NULL,
  `job_url` varchar(191) NOT NULL,
  `friend_name` varchar(191) NOT NULL,
  `friend_email` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `email_templates`
--

CREATE TABLE `email_templates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `template_name` varchar(191) NOT NULL,
  `subject` varchar(191) NOT NULL,
  `body` text NOT NULL,
  `variables` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `email_templates`
--

INSERT INTO `email_templates` (`id`, `template_name`, `subject`, `body`, `variables`, `created_at`, `updated_at`) VALUES
(1, 'Job Notification', 'New Job Notification', '<strong style=\"text-align: left;\" class=\"text-blue-color\">\n                               Hi {{candidate_name}},\n                            </strong>\n                            <br/><br>\n                            Notification of all Job opportunities updated on {{date}} in <a target=\"_blank\" href=\"{{app_url}}\">{{from_name}}</a>\n                            <br/><br>\n                            {{jobs}}\n                            <strong style=\"display: block; margin-top: 15px;\" class=\"text-blue-color\">Regards, <br/>\n                                {{from_name}}\n                            </strong>', '{{candidate_name}}, {{app_url}}, {{from_name}}', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(2, 'Contact Us', 'Thanks For Contacting', ' <strong style=\"text-align: left;\" class=\"text-blue-color\">\n                                Hello! {{name}},\n                            </strong>\n                            <br/><br>\n                            Thanks for contacting us.\n                            <br/><br>\n                            Quaerat facere dicta<br/><br>\n                            Apart from the email, you can also contact me on my cell : {{phone_no}}<br><br>\n                            <strong style=\"display: block; margin-top: 15px;\" class=\"text-blue-color\">Regards, <br/>\n                                {{from_name}}\n                            </strong>', '{{name}}, {{phone_no}}, {{from_name}}', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(3, 'News Letter', '', '<strong style=\"text-align: left;\" class=\"text-blue-color\">\n                                Hello Dear,\n                            </strong>\n                            <br/><br>\n                            New Notice from {{from_name}}. <br/><br>\n                            {{description}}<br><br>\n                            <strong style=\"display: block; margin-top: 15px;\" class=\"text-blue-color\">Regards, <br/>\n                                {{from_name}}\n                            </strong>', '{{description}}, {{from_name}}', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(4, 'Email Job To Friend', 'Email for Job Details', ' <strong style=\"text-align: left;\" class=\"text-blue-color\">\n                                Hi {{friend_name}},\n                            </strong>\n                            <br/><br>\n                            I have send you the below job link in which you can find the relevant details for the same.\n                            <br/><br>\n                                Link : <a href=\"{{job_url}}\" target=\"_blank\">{{job_url}}</a>\n                            <br><br>\n                            <strong style=\"display: block; margin-top: 15px;\" class=\"text-blue-color\">Regards, <br/>\n                                {{from_name}}\n                            </strong>', '{{friend_name}}, {{job_url}}, {{from_name}}', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(5, 'Job Alert', 'New Job Alert', '<strong style=\"text-align: left;\" class=\"text-blue-color\">\n                               Hi {{job_name}},\n                            </strong>\n                            <br/><br>\n                            <h2>Job Title: {{job_title}}</h2>\n                            <br/><br>\n                            New job posted with {{job_title}}, if you are interested then you can apply for this job.<br><br><br>\n                            <a href=\"{{job_url}}\" target=\"_blank\" style=\"display: table; margin: 0 auto;\">View Job</a>\n                            <br><br>\n                            <strong style=\"display: block; margin-top: 15px;\" class=\"text-blue-color\">Thanks, <br/>\n                                {{from_name}}\n                            </strong>', '{{job_name}},{{job_url}}, {{job_title}}, {{from_name}}', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(6, 'Candidate Job Applied', 'Job Applied by Candidate', '<strong style=\"text-align: left;\" class=\"text-blue-color\">\n                                Hi {{employer_fullName}},\n                            </strong>\n                            <br/><br>\n                            <h2>Someone just applied for job : {{job_title}}</h2>\n                            <br/><br>\n                            My name is {{candidate_name}}<br><br>\n                            I have go through with your job details and thereby i have applied for the same. Please kindly contact me if i found suitable based on your needs.<br><br><br>\n                            <a href=\"{{candidate_details_url}}\" target=\"_blank\" style=\"display: table; margin: 0 auto;\">View Candidate Profile</a>\n                            <br><br>\n                            <strong style=\"display: block; margin-top: 15px;\" class=\"text-blue-color\">Regards, <br/>\n                                {{from_name}}\n                            </strong>', '{{employer_fullName}},{{candidate_name}},{{candidate_details_url}}, {{job_title}}, {{from_name}}', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(7, 'Verify Email', 'Verify Email Address', '<strong style=\"text-align: left;\" class=\"text-blue-color\">\n                                Hello! {{user_name}},\n                            </strong>\n                            <br/><br>\n                            Please click the button below to verify your email address.\n                            <br/><br><br>\n                                <a href=\"{{verify_url}}\" style=\"display: table; margin: 0 auto;\">Verify Email Address</a>\n                            <br><br>\n                            If you did not create an account, no further action is required.<br><br>\n                            <strong style=\"display: block; margin-top: 15px;\" class=\"text-blue-color\">Regards, <br/>\n                                {{from_name}}\n                            </strong>', '{{user_name}},{{verify_url}},{{from_name}}', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(8, 'Password Reset Email', 'Reset Password Notification', '<strong style=\"text-align: left;\" class=\"text-blue-color\">\n                                Hello!,\n                            </strong>\n                            <br/><br>\n                            You are receiving this email because we received a password reset request for your account.\n                            <br/><br><br>\n                            <a href=\"{{reset_url}}\" style=\"display: table; margin: 0 auto;\">Reset Password</a>\n                            <br><br>\n                            This password reset link will expire in 60 minutes.<br><br>\n                            If you did not request a password reset, no further action is required.<br><br>\n                            <strong style=\"display: block; margin-top: 15px;\" class=\"text-blue-color\">Regards, <br/>\n                                {{from_name}}\n                            </strong>\n                            ', '{{reset_url}},{{from_name}}', '2022-10-04 06:43:43', '2022-10-04 06:43:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(191) DEFAULT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `faqs`
--

CREATE TABLE `faqs` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `favourite_companies`
--

CREATE TABLE `favourite_companies` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `favourite_jobs`
--

CREATE TABLE `favourite_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `job_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `featured_records`
--

CREATE TABLE `featured_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `owner_id` int(10) UNSIGNED NOT NULL,
  `owner_type` varchar(191) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `stripe_id` varchar(191) DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `meta` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `front_settings`
--

CREATE TABLE `front_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `front_settings`
--

INSERT INTO `front_settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'featured_jobs_price', '0', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(2, 'featured_jobs_days', '10', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(3, 'featured_jobs_quota', '10', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(4, 'featured_companies_price', '0', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(5, 'featured_companies_days', '10', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(6, 'featured_companies_quota', '10', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(7, 'featured_jobs_enable', '0', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(8, 'featured_companies_enable', '0', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(9, 'currency', '205', '2022-10-04 06:43:43', '2023-01-30 15:20:06'),
(10, 'latest_jobs_enable', '0', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(11, 'advertise_image', 'assets/img/infyom-logo.png', '2022-10-04 06:43:43', '2022-10-04 06:43:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `functional_areas`
--

CREATE TABLE `functional_areas` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(170) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `functional_areas`
--

INSERT INTO `functional_areas` (`id`, `name`, `created_at`, `updated_at`, `is_default`) VALUES
(1, 'Human Resource', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(2, 'Marketing/Promotion', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(3, 'Customer Service Support', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(4, 'Sales', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(5, 'Accounting and Finance', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(6, 'Distribution', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(7, 'Research and Development', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(8, 'Administrative/Management', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(9, 'Production', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(10, 'Operations', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(11, 'IT Support', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `header_sliders`
--

CREATE TABLE `header_sliders` (
  `id` int(10) UNSIGNED NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `image_sliders`
--

CREATE TABLE `image_sliders` (
  `id` int(10) UNSIGNED NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `industries`
--

CREATE TABLE `industries` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(170) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `industries`
--

INSERT INTO `industries` (`id`, `name`, `description`, `created_at`, `updated_at`, `is_default`) VALUES
(1, 'Ayuntamiento', 'Ayuntamiento y poblaciones', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inquiries`
--

CREATE TABLE `inquiries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone_no` varchar(191) DEFAULT NULL,
  `subject` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs`
--

CREATE TABLE `jobs` (
  `id` int(10) UNSIGNED NOT NULL,
  `job_id` varchar(191) NOT NULL,
  `job_title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `country_id` bigint(20) UNSIGNED DEFAULT NULL,
  `state_id` bigint(20) UNSIGNED DEFAULT NULL,
  `city_id` bigint(20) UNSIGNED DEFAULT NULL,
  `salary_from` double NOT NULL,
  `salary_to` double NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `job_category_id` int(10) UNSIGNED NOT NULL,
  `currency_id` int(10) UNSIGNED NOT NULL,
  `salary_period_id` int(10) UNSIGNED NOT NULL,
  `job_type_id` int(10) UNSIGNED NOT NULL,
  `career_level_id` int(10) UNSIGNED DEFAULT NULL,
  `functional_area_id` int(10) UNSIGNED NOT NULL,
  `job_shift_id` int(10) UNSIGNED DEFAULT NULL,
  `degree_level_id` int(10) UNSIGNED DEFAULT NULL,
  `position` int(11) NOT NULL,
  `job_expiry_date` date NOT NULL,
  `no_preference` int(10) UNSIGNED DEFAULT NULL,
  `hide_salary` tinyint(1) NOT NULL,
  `is_freelance` tinyint(1) NOT NULL,
  `is_suspended` tinyint(1) NOT NULL DEFAULT 0,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `experience` int(11) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `is_created_by_admin` int(11) NOT NULL DEFAULT 0,
  `last_change` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs_alerts`
--

CREATE TABLE `jobs_alerts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `candidate_id` int(10) UNSIGNED NOT NULL,
  `job_type_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs_skill`
--

CREATE TABLE `jobs_skill` (
  `id` int(10) UNSIGNED NOT NULL,
  `job_id` int(10) UNSIGNED NOT NULL,
  `skill_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs_tag`
--

CREATE TABLE `jobs_tag` (
  `id` int(10) UNSIGNED NOT NULL,
  `job_id` int(10) UNSIGNED NOT NULL,
  `tag_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_applications`
--

CREATE TABLE `job_applications` (
  `id` int(10) UNSIGNED NOT NULL,
  `job_id` int(10) UNSIGNED NOT NULL,
  `candidate_id` int(10) UNSIGNED NOT NULL,
  `resume_id` int(11) NOT NULL,
  `expected_salary` double NOT NULL,
  `notes` text DEFAULT NULL,
  `job_stage_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_application_schedules`
--

CREATE TABLE `job_application_schedules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `job_application_id` int(10) UNSIGNED NOT NULL,
  `stage_id` bigint(20) UNSIGNED NOT NULL,
  `time` varchar(191) NOT NULL,
  `date` varchar(191) NOT NULL,
  `notes` text DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `batch` int(11) DEFAULT NULL,
  `rejected_slot_notes` text DEFAULT NULL,
  `employer_cancel_slot_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_categories`
--

CREATE TABLE `job_categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(170) NOT NULL,
  `description` text DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `job_categories`
--

INSERT INTO `job_categories` (`id`, `name`, `description`, `is_featured`, `created_at`, `updated_at`, `is_default`) VALUES
(1, 'Socorrismo de piscinas', 'Socorrismo de piscinas', 1, '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(2, ' Socorrismo de playas.', ' Socorrismo de playas.', 1, '2022-10-04 06:43:42', '2023-01-30 14:45:56', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_shifts`
--

CREATE TABLE `job_shifts` (
  `id` int(10) UNSIGNED NOT NULL,
  `shift` varchar(170) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `job_shifts`
--

INSERT INTO `job_shifts` (`id`, `shift`, `description`, `created_at`, `updated_at`, `is_default`) VALUES
(1, 'Turno', 'Turno', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(2, 'Jornada Completa', 'Completo', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_stages`
--

CREATE TABLE `job_stages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_types`
--

CREATE TABLE `job_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(170) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `job_types`
--

INSERT INTO `job_types` (`id`, `name`, `description`, `created_at`, `updated_at`, `is_default`) VALUES
(1, ' Socorrismo de piscinas', ' Socorrismo de piscinas.', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(2, ' Socorrismo de playas', ' Socorrismo de playas.', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `languages`
--

CREATE TABLE `languages` (
  `id` int(10) UNSIGNED NOT NULL,
  `language` varchar(191) NOT NULL,
  `iso_code` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `languages`
--

INSERT INTO `languages` (`id`, `language`, `iso_code`, `created_at`, `updated_at`, `is_default`) VALUES
(1, 'English', 'eng', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(9, 'Español', 'es', '2023-01-30 14:39:34', '2023-01-30 14:39:34', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marital_status`
--

CREATE TABLE `marital_status` (
  `id` int(10) UNSIGNED NOT NULL,
  `marital_status` varchar(170) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `marital_status`
--

INSERT INTO `marital_status` (`id`, `marital_status`, `description`, `created_at`, `updated_at`, `is_default`) VALUES
(5, 'Simple', '<p>Simple</p>', '2022-10-04 06:43:42', '2023-01-30 14:27:16', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `media`
--

CREATE TABLE `media` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(191) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL,
  `collection_name` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `file_name` varchar(191) NOT NULL,
  `mime_type` varchar(191) DEFAULT NULL,
  `disk` varchar(191) NOT NULL,
  `size` bigint(20) UNSIGNED NOT NULL,
  `manipulations` text NOT NULL,
  `custom_properties` text NOT NULL,
  `responsive_images` text NOT NULL,
  `order_column` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `conversions_disk` varchar(191) DEFAULT NULL,
  `uuid` char(36) DEFAULT NULL,
  `generated_conversions` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(191) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_10_045631_create_countries_table', 1),
(2, '2014_10_12_045650_create_states_table', 1),
(3, '2014_10_12_045711_create_cities_table', 1),
(4, '2014_10_12_045722_create_users_table', 1),
(5, '2014_10_12_100000_create_password_resets_table', 1),
(6, '2019_08_19_000000_create_failed_jobs_table', 1),
(7, '2020_06_19_071110_create_media_table', 1),
(8, '2020_06_19_071420_create_permission_tables', 1),
(9, '2020_06_19_102134_create_job_categories_table', 1),
(10, '2020_06_20_082711_create_settings_table', 1),
(11, '2020_06_20_121439_create_company_sizes_table', 1),
(12, '2020_06_20_134118_create_industries_table', 1),
(13, '2020_06_22_094719_create_owner_ship_types_table', 1),
(14, '2020_06_22_115654_create_job_tags_table', 1),
(15, '2020_06_22_123442_create_companies_table', 1),
(16, '2020_06_22_124347_create_job_types_table', 1),
(17, '2020_06_23_095255_create_salary_periods_table', 1),
(18, '2020_06_23_105948_create_job_shifts_table', 1),
(19, '2020_06_23_125514_create_marital_status_table', 1),
(20, '2020_06_30_123008_create_required_degree_levels_table', 1),
(21, '2020_07_03_091217_create_languages_table', 1),
(22, '2020_07_04_072608_create_functional_areas_table', 1),
(23, '2020_07_07_050739_create_career_levels_table', 1),
(24, '2020_07_07_064147_create_salary_currencies_table', 1),
(25, '2020_07_10_052359_create_skills_table', 1),
(26, '2020_07_11_102026_create_jobs_table', 1),
(27, '2020_07_11_130415_create_jobs_skill_table', 1),
(28, '2020_07_13_113119_add_suspended_and_is_featured_column_into_jobs_table', 1),
(29, '2020_07_20_054803_create_candidates_table', 1),
(30, '2020_07_22_093729_create_testimonials_table', 1),
(31, '2020_07_22_094459_create_favourite_jobs_table', 1),
(32, '2020_07_22_122321_create_reported_jobs_table', 1),
(33, '2020_07_22_133224_create_job_applications_table', 1),
(34, '2020_07_23_111237_create_candidate_experiences_table', 1),
(35, '2020_07_23_111414_create_email_jobs_table', 1),
(36, '2020_07_24_072123_create_favourite_companies_table', 1),
(37, '2020_07_24_094449_create_reported_to_companies_table', 1),
(38, '2020_07_24_112818_create_candidate_educations_table', 1),
(39, '2020_07_29_115041_create_candidate_language_table', 1),
(40, '2020_07_30_053934_create_news_letters_table', 1),
(41, '2020_07_30_081848_create_noticeboards_table', 1),
(42, '2020_07_30_084222_create_candidate_skills_table', 1),
(43, '2020_07_30_093609_create_faqs_table', 1),
(44, '2020_07_31_040917_create_inquiries_table', 1),
(45, '2020_07_31_050755_create_post_categories_table', 1),
(46, '2020_07_31_061741_create_posts_table', 1),
(47, '2020_07_31_064138_create_post_assigned_categories_table', 1),
(48, '2020_08_14_115324_remove_social_links_from_companies', 1),
(49, '2020_08_14_120001_add_social_links_to_users', 1),
(50, '2020_08_20_050324_create_reported_to_candidates_table', 1),
(51, '2020_08_20_061202_changes_on_columns_to_jobs', 1),
(52, '2020_08_22_044709_rename_job_tags_to_tags', 1),
(53, '2020_08_22_045051_create_jobs_tag_table', 1),
(54, '2020_08_22_055108_add_experience_column_to_jobs', 1),
(55, '2020_08_22_091337_add_default_flag_into_tables', 1),
(56, '2020_09_28_121913_create_plans_table', 1),
(57, '2020_09_28_121914_create_subscriptions_table', 1),
(58, '2020_09_28_122226_create_transactions_table', 1),
(59, '2020_09_29_122228_create_subscription_items_table', 1),
(60, '2020_09_30_123653_add_stripe_id_in_users_table', 1),
(61, '2020_10_01_101638_create_featured_records_table', 1),
(62, '2020_10_01_103316_create_social_accounts_table', 1),
(63, '2020_10_01_105745_create_front_settings_table', 1),
(64, '2020_10_05_130353_add_soft_deletes_to_plans_table', 1),
(65, '2020_10_06_073926_changes_on_columns_in_transactions_table', 1),
(66, '2020_10_10_053314_drop_featured_column_from_companies_and_jobs', 1),
(67, '2020_10_12_050703_nullable_stripe_id_to_featured_records_table', 1),
(68, '2020_10_16_122711_add_job_alert_field_to_candidates_table', 1),
(69, '2020_10_16_123513_create_jobs_alerts_table', 1),
(70, '2020_10_27_121154_add_region_code_to_users', 1),
(71, '2020_11_06_111241_create_image_slider_table', 1),
(72, '2020_11_23_100925_create_notifications_table', 1),
(73, '2020_11_24_113854_add_icon_in_salary_currencies_table', 1),
(74, '2020_11_28_091936_create_notification_settings_table', 1),
(75, '2020_12_11_052318_add_type_in_notification_settings_table', 1),
(76, '2020_12_16_042032_create_header_sliders_table', 1),
(77, '2020_12_18_133145_add_paypal_payment_id_into_subscriptions_table', 1),
(78, '2020_12_19_042028_create_branding_sliders_table', 1),
(79, '2020_12_26_044333_add_available_at_in_candidates_table', 1),
(80, '2021_02_09_091223_remove_provider_unique_rule_from_social_accounts', 1),
(81, '2021_04_12_103529_add_salary_currency_id_into_plans_table', 1),
(82, '2021_04_13_070142_add_currecy_code_to_salary_currencies_table', 1),
(83, '2021_06_04_051824_create_email_templates_table', 1),
(84, '2021_06_29_000000_add_uuid_to_failed_jobs_table', 1),
(85, '2021_07_08_085344_create_post_comments_table', 1),
(86, '2021_07_08_121050_add_column_is_created_by_admin_in_jobs_table', 1),
(87, '2021_07_10_070048_create_job_stages_table', 1),
(88, '2021_07_10_104206_add_job_stage_in_job_applications', 1),
(89, '2021_07_10_114138_create_job_application_schedules_table', 1),
(90, '2021_07_1_103036_add_conversions_disk_column_in_media_table', 1),
(91, '2021_08_13_060723_create_location2_in_companies_table', 1),
(92, '2021_11_23_101602_create_cms_services_table', 1),
(93, '2022_03_02_104056_add_theme_mode_to_users_table', 1),
(94, '2022_08_27_041123_add_payment_status_field_to_transactions_table', 1),
(95, '2022_08_29_090208_add_is_approved_to_transactions_table', 1),
(96, '2022_09_23_053617_add_approved_id_to_transactions_table', 1),
(97, '2022_09_23_063254_add_last_change_to_jobs_table', 1),
(98, '2022_09_23_072320_add_last_change_to_companies_table', 1),
(99, '2022_09_23_075427_add_last_change_to_candidates_table', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(191) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(191) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `news_letters`
--

CREATE TABLE `news_letters` (
  `id` int(10) UNSIGNED NOT NULL,
  `email` varchar(170) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `noticeboards`
--

CREATE TABLE `noticeboards` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notifications`
--

CREATE TABLE `notifications` (
  `id` int(10) UNSIGNED NOT NULL,
  `type` int(11) NOT NULL,
  `notification_for` int(11) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(191) NOT NULL,
  `text` text DEFAULT NULL,
  `meta` text DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notification_settings`
--

CREATE TABLE `notification_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(191) NOT NULL,
  `type` varchar(191) DEFAULT NULL,
  `value` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `notification_settings`
--

INSERT INTO `notification_settings` (`id`, `key`, `type`, `value`, `created_at`, `updated_at`) VALUES
(1, 'JOB_APPLICATION_SUBMITTED', 'employer', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(2, 'MARK_JOB_FEATURED', 'employer', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(3, 'MARK_COMPANY_FEATURED', 'employer', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(4, 'CANDIDATE_SELECTED_FOR_JOB', 'candidate', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(5, 'CANDIDATE_REJECTED_FOR_JOB', 'candidate', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(6, 'CANDIDATE_SHORTLISTED_FOR_JOB', 'candidate', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(7, 'NEW_EMPLOYER_REGISTERED', 'admin', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(8, 'NEW_CANDIDATE_REGISTERED', 'admin', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(9, 'EMPLOYER_PURCHASE_PLAN', 'admin', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(10, 'FOLLOW_COMPANY', 'employer', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(11, 'FOLLOW_JOB', 'employer', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(12, 'JOB_ALERT', 'candidate', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(13, 'MARK_COMPANY_FEATURED_ADMIN', 'admin', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(14, 'MARK_JOB_FEATURED_ADMIN', 'admin', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ownership_types`
--

CREATE TABLE `ownership_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(170) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ownership_types`
--

INSERT INTO `ownership_types` (`id`, `name`, `description`, `created_at`, `updated_at`, `is_default`) VALUES
(1, 'Sole Proprietorship', 'The sole proprietorship is the simplest business form under which one can operate a business.', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(2, 'Public', 'A company whose shares are traded freely on a stock exchange.', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(3, 'Private', 'A company whose shares may not be offered to the public for sale and which operates under legal requirements less strict than those for a public company.', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(4, 'Government', 'A government company is a company in which 51% or more of the paid-up capital is held by the Government or State Government.', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(5, 'NGO', 'A non-profit organization that operates independently of any government, typically one whose purpose is to address a social or political issue.', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `guard_name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plans`
--

CREATE TABLE `plans` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `stripe_plan_id` varchar(191) DEFAULT NULL,
  `allowed_jobs` int(11) NOT NULL,
  `amount` double NOT NULL,
  `salary_currency_id` int(10) UNSIGNED NOT NULL,
  `is_trial_plan` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `plans`
--

INSERT INTO `plans` (`id`, `name`, `stripe_plan_id`, `allowed_jobs`, `amount`, `salary_currency_id`, `is_trial_plan`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Trial Plan', NULL, 1, 1, 130, 1, '2022-10-04 06:43:41', '2023-01-30 14:29:17', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `posts`
--

CREATE TABLE `posts` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `post_assigned_categories`
--

CREATE TABLE `post_assigned_categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `post_id` int(10) UNSIGNED NOT NULL,
  `post_categories_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `post_categories`
--

CREATE TABLE `post_categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `post_comments`
--

CREATE TABLE `post_comments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `email` varchar(170) NOT NULL,
  `comment` text NOT NULL,
  `post_id` int(10) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reported_jobs`
--

CREATE TABLE `reported_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `job_id` int(10) UNSIGNED NOT NULL,
  `note` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reported_to_candidates`
--

CREATE TABLE `reported_to_candidates` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `candidate_id` int(10) UNSIGNED NOT NULL,
  `note` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reported_to_companies`
--

CREATE TABLE `reported_to_companies` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `note` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `required_degree_levels`
--

CREATE TABLE `required_degree_levels` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(170) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `required_degree_levels`
--

INSERT INTO `required_degree_levels` (`id`, `name`, `created_at`, `updated_at`, `is_default`) VALUES
(1, 'Título de socorrismo', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(2, 'DEA ', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(3, 'ROPEC ', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `guard_name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'web', '2022-10-04 06:43:42', '2022-10-04 06:43:42'),
(2, 'Employer', 'web', '2022-10-04 06:43:42', '2022-10-04 06:43:42'),
(3, 'Candidate', 'web', '2022-10-04 06:43:42', '2022-10-04 06:43:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salary_currencies`
--

CREATE TABLE `salary_currencies` (
  `id` int(10) UNSIGNED NOT NULL,
  `currency_name` varchar(170) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `currency_icon` varchar(191) NOT NULL DEFAULT '$',
  `currency_code` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `salary_currencies`
--

INSERT INTO `salary_currencies` (`id`, `currency_name`, `created_at`, `updated_at`, `is_default`, `currency_icon`, `currency_code`) VALUES
(130, 'EUR Euro', '2022-10-04 06:43:43', '2022-10-04 06:43:43', 1, '€', 'EUR');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salary_periods`
--

CREATE TABLE `salary_periods` (
  `id` int(10) UNSIGNED NOT NULL,
  `period` varchar(170) NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `salary_periods`
--

INSERT INTO `salary_periods` (`id`, `period`, `description`, `created_at`, `updated_at`, `is_default`) VALUES
(1, 'por semana', 'por semana', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(2, 'Por dia', 'Por dia', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(3, 'por quincena', 'por quincena', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(4, 'Mensual', 'Mensual', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `settings`
--

CREATE TABLE `settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'application_name', 'SocoJobs', '2022-10-04 06:43:42', '2022-10-04 06:43:42'),
(2, 'logo', 'assets/img/infyom-logo.png', '2022-10-04 06:43:42', '2022-10-04 06:43:42'),
(3, 'favicon', 'favicon.ico', '2022-10-04 06:43:42', '2022-10-04 06:43:42'),
(4, 'company_description', 'SocoJobs SocoJobs SocoJobs', '2022-10-04 06:43:42', '2022-10-04 06:43:42'),
(5, 'address', 'SocoJobs españa', '2022-10-04 06:43:42', '2022-10-04 06:43:42'),
(6, 'phone', '321321321', '2022-10-04 06:43:42', '2022-10-04 06:43:43'),
(7, 'email', 'contact@SocoJobs.com', '2022-10-04 06:43:04', '2022-10-04 06:43:42'),
(8, 'facebook_url', 'https://www.facebook.com/', '2022-10-04 06:43:42', '2022-10-04 06:43:42'),
(9, 'twitter_url', 'https://twitter.com', '2022-10-04 06:43:42', '2022-10-04 06:43:42'),
(10, 'google_plus_url', 'https://SocoJobs.com/', '2022-10-04 06:43:42', '2022-10-04 06:43:42'),
(11, 'linkedIn_url', 'https://www.linkedin.com', '2022-10-04 06:43:42', '2022-10-04 06:43:42'),
(12, 'about_us', 'loren ipsum.', '2022-10-04 06:43:42', '2022-10-04 06:43:42'),
(13, 'company_url', 'www.socoJobs.com', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(14, 'region_code', '34', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(15, 'slider_is_active', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(16, 'is_full_slider', '0', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(17, 'is_slider_active', '1', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(18, 'privacy_policy', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(19, 'terms_conditions', 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(20, 'enable_google_recaptcha', '0', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(21, 'footer_logo', 'assets/img/infyom-logo.png', '2022-10-04 06:43:43', '2022-10-04 06:43:43'),
(22, 'default_country_code', 'es', '2022-10-04 06:43:43', '2022-10-04 06:43:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `skills`
--

CREATE TABLE `skills` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `skills`
--

INSERT INTO `skills` (`id`, `name`, `description`, `created_at`, `updated_at`, `is_default`) VALUES
(1, 'Socorrisyta piscina', 'Computer piscina', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(2, 'Socorrista Playa', 'Socorrista Playa', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(3, 'Socorrista Laguna', 'Socorrista Laguna', '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `social_accounts`
--

CREATE TABLE `social_accounts` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `provider` varchar(191) NOT NULL,
  `provider_id` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `states`
--

CREATE TABLE `states` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `country_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `states`
--

INSERT INTO `states` (`id`, `country_id`, `name`, `created_at`, `updated_at`) VALUES
(3254, 205, 'A Coruna', NULL, NULL),
(3255, 205, 'Alacant', NULL, NULL),
(3256, 205, 'Alava', NULL, NULL),
(3257, 205, 'Albacete', NULL, NULL),
(3258, 205, 'Almeria', NULL, NULL),
(3259, 205, 'Andalucia', NULL, NULL),
(3260, 205, 'Asturias', NULL, NULL),
(3261, 205, 'Avila', NULL, NULL),
(3262, 205, 'Badajoz', NULL, NULL),
(3263, 205, 'Balears', NULL, NULL),
(3264, 205, 'Barcelona', NULL, NULL),
(3265, 205, 'Bertamirans', NULL, NULL),
(3266, 205, 'Biscay', NULL, NULL),
(3267, 205, 'Burgos', NULL, NULL),
(3268, 205, 'Caceres', NULL, NULL),
(3269, 205, 'Cadiz', NULL, NULL),
(3270, 205, 'Cantabria', NULL, NULL),
(3271, 205, 'Castello', NULL, NULL),
(3272, 205, 'Catalunya', NULL, NULL),
(3273, 205, 'Ceuta', NULL, NULL),
(3274, 205, 'Ciudad Real', NULL, NULL),
(3275, 205, 'Comunidad Autonoma de Canarias', NULL, NULL),
(3276, 205, 'Comunidad Autonoma de Cataluna', NULL, NULL),
(3277, 205, 'Comunidad Autonoma de Galicia', NULL, NULL),
(3278, 205, 'Comunidad Autonoma de las Isla', NULL, NULL),
(3279, 205, 'Comunidad Autonoma del Princip', NULL, NULL),
(3280, 205, 'Comunidad Valenciana', NULL, NULL),
(3281, 205, 'Cordoba', NULL, NULL),
(3282, 205, 'Cuenca', NULL, NULL),
(3283, 205, 'Gipuzkoa', NULL, NULL),
(3284, 205, 'Girona', NULL, NULL),
(3285, 205, 'Granada', NULL, NULL),
(3286, 205, 'Guadalajara', NULL, NULL),
(3287, 205, 'Guipuzcoa', NULL, NULL),
(3288, 205, 'Huelva', NULL, NULL),
(3289, 205, 'Huesca', NULL, NULL),
(3290, 205, 'Jaen', NULL, NULL),
(3291, 205, 'La Rioja', NULL, NULL),
(3292, 205, 'Las Palmas', NULL, NULL),
(3293, 205, 'Leon', NULL, NULL),
(3294, 205, 'Lerida', NULL, NULL),
(3295, 205, 'Lleida', NULL, NULL),
(3296, 205, 'Lugo', NULL, NULL),
(3297, 205, 'Madrid', NULL, NULL),
(3298, 205, 'Malaga', NULL, NULL),
(3299, 205, 'Melilla', NULL, NULL),
(3300, 205, 'Murcia', NULL, NULL),
(3301, 205, 'Navarra', NULL, NULL),
(3302, 205, 'Ourense', NULL, NULL),
(3303, 205, 'Pais Vasco', NULL, NULL),
(3304, 205, 'Palencia', NULL, NULL),
(3305, 205, 'Pontevedra', NULL, NULL),
(3306, 205, 'Salamanca', NULL, NULL),
(3307, 205, 'Santa Cruz de Tenerife', NULL, NULL),
(3308, 205, 'Segovia', NULL, NULL),
(3309, 205, 'Sevilla', NULL, NULL),
(3310, 205, 'Soria', NULL, NULL),
(3311, 205, 'Tarragona', NULL, NULL),
(3312, 205, 'Tenerife', NULL, NULL),
(3313, 205, 'Teruel', NULL, NULL),
(3314, 205, 'Toledo', NULL, NULL),
(3315, 205, 'Valencia', NULL, NULL),
(3316, 205, 'Valladolid', NULL, NULL),
(3317, 205, 'Vizcaya', NULL, NULL),
(3318, 205, 'Zamora', NULL, NULL),
(3319, 205, 'Zaragoza', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `stripe_id` varchar(191) DEFAULT NULL,
  `stripe_status` varchar(191) DEFAULT NULL,
  `stripe_plan` varchar(191) DEFAULT NULL,
  `plan_id` int(10) UNSIGNED DEFAULT NULL,
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `current_period_start` timestamp NULL DEFAULT NULL,
  `current_period_end` timestamp NULL DEFAULT NULL,
  `cancellation_reason` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `type` varchar(191) NOT NULL DEFAULT '1',
  `paypal_payment_id` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subscription_items`
--

CREATE TABLE `subscription_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `subscription_id` bigint(20) UNSIGNED NOT NULL,
  `stripe_id` varchar(191) NOT NULL,
  `stripe_plan` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tags`
--

CREATE TABLE `tags` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(170) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tags`
--

INSERT INTO `tags` (`id`, `name`, `description`, `created_at`, `updated_at`, `is_default`) VALUES
(1, 'Piscinas', NULL, '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1),
(2, 'Playa', NULL, '2022-10-04 06:43:42', '2022-10-04 06:43:42', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `testimonials`
--

CREATE TABLE `testimonials` (
  `id` int(10) UNSIGNED NOT NULL,
  `customer_name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transactions`
--

CREATE TABLE `transactions` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` varchar(191) DEFAULT NULL,
  `amount` double(8,2) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `is_approved` int(11) NOT NULL DEFAULT 1,
  `approved_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `owner_id` int(10) UNSIGNED NOT NULL,
  `owner_type` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(191) NOT NULL,
  `last_name` varchar(191) DEFAULT NULL,
  `email` varchar(170) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` int(11) DEFAULT NULL,
  `country_id` bigint(20) UNSIGNED DEFAULT NULL,
  `state_id` bigint(20) UNSIGNED DEFAULT NULL,
  `city_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_verified` tinyint(1) NOT NULL DEFAULT 1,
  `owner_id` int(11) DEFAULT NULL,
  `owner_type` varchar(191) DEFAULT NULL,
  `language` varchar(191) NOT NULL DEFAULT 'en',
  `profile_views` bigint(20) NOT NULL DEFAULT 0,
  `remember_token` varchar(100) DEFAULT NULL,
  `theme_mode` varchar(191) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `facebook_url` varchar(191) DEFAULT NULL,
  `twitter_url` varchar(191) DEFAULT NULL,
  `linkedin_url` varchar(191) DEFAULT NULL,
  `google_plus_url` varchar(191) DEFAULT NULL,
  `pinterest_url` varchar(191) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `stripe_id` varchar(191) DEFAULT NULL,
  `region_code` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `phone`, `email_verified_at`, `password`, `dob`, `gender`, `country_id`, `state_id`, `city_id`, `is_active`, `is_verified`, `owner_id`, `owner_type`, `language`, `profile_views`, `remember_token`, `theme_mode`, `created_at`, `updated_at`, `facebook_url`, `twitter_url`, `linkedin_url`, `google_plus_url`, `pinterest_url`, `is_default`, `stripe_id`, `region_code`) VALUES
(1, 'Super', 'Admin', 'admin@socojob.com', '123412341234', '2022-10-04 06:43:42', '$2y$10$rkZelj2K6i7g/rJtYqKgF.TrfEWFLp3Q0kBbsYwnerC.RDkXYR.se', NULL, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, 'es', 0, NULL, '0', '2022-10-04 06:43:42', '2023-01-30 14:40:18', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `branding_sliders`
--
ALTER TABLE `branding_sliders`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `candidates`
--
ALTER TABLE `candidates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `candidates_user_id_foreign` (`user_id`),
  ADD KEY `candidates_marital_status_id_foreign` (`marital_status_id`),
  ADD KEY `candidates_career_level_id_foreign` (`career_level_id`),
  ADD KEY `candidates_functional_area_id_foreign` (`functional_area_id`),
  ADD KEY `candidates_industry_id_foreign` (`industry_id`),
  ADD KEY `candidates_last_change_foreign` (`last_change`);

--
-- Indices de la tabla `candidate_educations`
--
ALTER TABLE `candidate_educations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `candidate_educations_candidate_id_foreign` (`candidate_id`),
  ADD KEY `candidate_educations_degree_level_id_foreign` (`degree_level_id`),
  ADD KEY `candidate_educations_country_id_foreign` (`country_id`),
  ADD KEY `candidate_educations_state_id_foreign` (`state_id`),
  ADD KEY `candidate_educations_city_id_foreign` (`city_id`);

--
-- Indices de la tabla `candidate_experiences`
--
ALTER TABLE `candidate_experiences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `candidate_experiences_candidate_id_foreign` (`candidate_id`),
  ADD KEY `candidate_experiences_country_id_foreign` (`country_id`),
  ADD KEY `candidate_experiences_state_id_foreign` (`state_id`),
  ADD KEY `candidate_experiences_city_id_foreign` (`city_id`);

--
-- Indices de la tabla `candidate_language`
--
ALTER TABLE `candidate_language`
  ADD PRIMARY KEY (`id`),
  ADD KEY `candidate_language_user_id_foreign` (`user_id`),
  ADD KEY `candidate_language_language_id_foreign` (`language_id`);

--
-- Indices de la tabla `candidate_skills`
--
ALTER TABLE `candidate_skills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `candidate_skills_user_id_foreign` (`user_id`),
  ADD KEY `candidate_skills_skill_id_foreign` (`skill_id`);

--
-- Indices de la tabla `career_levels`
--
ALTER TABLE `career_levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `career_levels_level_name_unique` (`level_name`);

--
-- Indices de la tabla `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cities_state_id_foreign` (`state_id`);

--
-- Indices de la tabla `cms_services`
--
ALTER TABLE `cms_services`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `companies_unique_id_unique` (`unique_id`),
  ADD KEY `companies_user_id_foreign` (`user_id`),
  ADD KEY `companies_industry_id_foreign` (`industry_id`),
  ADD KEY `companies_ownership_type_id_foreign` (`ownership_type_id`),
  ADD KEY `companies_company_size_id_foreign` (`company_size_id`),
  ADD KEY `companies_last_change_foreign` (`last_change`);

--
-- Indices de la tabla `company_sizes`
--
ALTER TABLE `company_sizes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `company_sizes_size_unique` (`size`);

--
-- Indices de la tabla `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `email_jobs`
--
ALTER TABLE `email_jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `email_jobs_user_id_foreign` (`user_id`),
  ADD KEY `email_jobs_job_id_foreign` (`job_id`);

--
-- Indices de la tabla `email_templates`
--
ALTER TABLE `email_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indices de la tabla `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `favourite_companies`
--
ALTER TABLE `favourite_companies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `favourite_companies_user_id_foreign` (`user_id`),
  ADD KEY `favourite_companies_company_id_foreign` (`company_id`);

--
-- Indices de la tabla `favourite_jobs`
--
ALTER TABLE `favourite_jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `favourite_jobs_user_id_foreign` (`user_id`),
  ADD KEY `favourite_jobs_job_id_foreign` (`job_id`);

--
-- Indices de la tabla `featured_records`
--
ALTER TABLE `featured_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `featured_records_user_id_foreign` (`user_id`);

--
-- Indices de la tabla `front_settings`
--
ALTER TABLE `front_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `functional_areas`
--
ALTER TABLE `functional_areas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `functional_areas_name_unique` (`name`);

--
-- Indices de la tabla `header_sliders`
--
ALTER TABLE `header_sliders`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `image_sliders`
--
ALTER TABLE `image_sliders`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `industries`
--
ALTER TABLE `industries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `industries_name_unique` (`name`);

--
-- Indices de la tabla `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_company_id_foreign` (`company_id`),
  ADD KEY `jobs_salary_period_id_foreign` (`salary_period_id`),
  ADD KEY `jobs_currency_id_foreign` (`currency_id`),
  ADD KEY `jobs_job_type_id_foreign` (`job_type_id`),
  ADD KEY `jobs_career_level_id_foreign` (`career_level_id`),
  ADD KEY `jobs_functional_area_id_foreign` (`functional_area_id`),
  ADD KEY `jobs_job_shift_id_foreign` (`job_shift_id`),
  ADD KEY `jobs_degree_level_id_foreign` (`degree_level_id`),
  ADD KEY `jobs_job_category_id_foreign` (`job_category_id`),
  ADD KEY `jobs_country_id_foreign` (`country_id`),
  ADD KEY `jobs_state_id_foreign` (`state_id`),
  ADD KEY `jobs_city_id_foreign` (`city_id`),
  ADD KEY `jobs_last_change_foreign` (`last_change`);

--
-- Indices de la tabla `jobs_alerts`
--
ALTER TABLE `jobs_alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_alerts_candidate_id_foreign` (`candidate_id`),
  ADD KEY `jobs_alerts_job_type_id_foreign` (`job_type_id`);

--
-- Indices de la tabla `jobs_skill`
--
ALTER TABLE `jobs_skill`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_skill_job_id_foreign` (`job_id`),
  ADD KEY `jobs_skill_skill_id_foreign` (`skill_id`);

--
-- Indices de la tabla `jobs_tag`
--
ALTER TABLE `jobs_tag`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_tag_job_id_foreign` (`job_id`),
  ADD KEY `jobs_tag_tag_id_foreign` (`tag_id`);

--
-- Indices de la tabla `job_applications`
--
ALTER TABLE `job_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_applications_job_id_foreign` (`job_id`),
  ADD KEY `job_applications_candidate_id_foreign` (`candidate_id`),
  ADD KEY `job_applications_job_stage_id_foreign` (`job_stage_id`);

--
-- Indices de la tabla `job_application_schedules`
--
ALTER TABLE `job_application_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_application_schedules_job_application_id_foreign` (`job_application_id`),
  ADD KEY `job_application_schedules_stage_id_foreign` (`stage_id`);

--
-- Indices de la tabla `job_categories`
--
ALTER TABLE `job_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `job_categories_name_unique` (`name`);

--
-- Indices de la tabla `job_shifts`
--
ALTER TABLE `job_shifts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `job_shifts_shift_unique` (`shift`);

--
-- Indices de la tabla `job_stages`
--
ALTER TABLE `job_stages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_stages_company_id_foreign` (`company_id`);

--
-- Indices de la tabla `job_types`
--
ALTER TABLE `job_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `job_types_name_unique` (`name`);

--
-- Indices de la tabla `languages`
--
ALTER TABLE `languages`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `marital_status`
--
ALTER TABLE `marital_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `marital_status_marital_status_unique` (`marital_status`);

--
-- Indices de la tabla `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `media_uuid_unique` (`uuid`),
  ADD KEY `media_model_type_model_id_index` (`model_type`,`model_id`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indices de la tabla `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indices de la tabla `news_letters`
--
ALTER TABLE `news_letters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `news_letters_email_unique` (`email`);

--
-- Indices de la tabla `noticeboards`
--
ALTER TABLE `noticeboards`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_foreign` (`user_id`);

--
-- Indices de la tabla `notification_settings`
--
ALTER TABLE `notification_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `ownership_types`
--
ALTER TABLE `ownership_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ownership_types_name_unique` (`name`);

--
-- Indices de la tabla `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);

--
-- Indices de la tabla `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `plans_name_unique` (`name`);

--
-- Indices de la tabla `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `posts_created_by_foreign` (`created_by`);

--
-- Indices de la tabla `post_assigned_categories`
--
ALTER TABLE `post_assigned_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_assigned_categories_post_id_foreign` (`post_id`),
  ADD KEY `post_assigned_categories_post_categories_id_foreign` (`post_categories_id`);

--
-- Indices de la tabla `post_categories`
--
ALTER TABLE `post_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `post_comments`
--
ALTER TABLE `post_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_comments_post_id_foreign` (`post_id`),
  ADD KEY `post_comments_user_id_foreign` (`user_id`);

--
-- Indices de la tabla `reported_jobs`
--
ALTER TABLE `reported_jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reported_jobs_user_id_foreign` (`user_id`),
  ADD KEY `reported_jobs_job_id_foreign` (`job_id`);

--
-- Indices de la tabla `reported_to_candidates`
--
ALTER TABLE `reported_to_candidates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reported_to_candidates_user_id_foreign` (`user_id`),
  ADD KEY `reported_to_candidates_candidate_id_foreign` (`candidate_id`);

--
-- Indices de la tabla `reported_to_companies`
--
ALTER TABLE `reported_to_companies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reported_to_companies_user_id_foreign` (`user_id`),
  ADD KEY `reported_to_companies_company_id_foreign` (`company_id`);

--
-- Indices de la tabla `required_degree_levels`
--
ALTER TABLE `required_degree_levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `required_degree_levels_name_unique` (`name`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indices de la tabla `salary_currencies`
--
ALTER TABLE `salary_currencies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `salary_currencies_currency_name_unique` (`currency_name`);

--
-- Indices de la tabla `salary_periods`
--
ALTER TABLE `salary_periods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `salary_periods_period_unique` (`period`);

--
-- Indices de la tabla `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `social_accounts`
--
ALTER TABLE `social_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `social_accounts_user_id_unique` (`user_id`),
  ADD UNIQUE KEY `social_accounts_provider_id_unique` (`provider_id`);

--
-- Indices de la tabla `states`
--
ALTER TABLE `states`
  ADD PRIMARY KEY (`id`),
  ADD KEY `states_country_id_foreign` (`country_id`);

--
-- Indices de la tabla `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscriptions_user_id_stripe_status_index` (`user_id`,`stripe_status`),
  ADD KEY `subscriptions_plan_id_foreign` (`plan_id`);

--
-- Indices de la tabla `subscription_items`
--
ALTER TABLE `subscription_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subscription_items_subscription_id_stripe_plan_unique` (`subscription_id`,`stripe_plan`),
  ADD KEY `subscription_items_stripe_id_index` (`stripe_id`);

--
-- Indices de la tabla `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `job_tags_name_unique` (`name`);

--
-- Indices de la tabla `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transactions_user_id_foreign` (`user_id`),
  ADD KEY `transactions_approved_id_foreign` (`approved_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_country_id_foreign` (`country_id`),
  ADD KEY `users_state_id_foreign` (`state_id`),
  ADD KEY `users_city_id_foreign` (`city_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `branding_sliders`
--
ALTER TABLE `branding_sliders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `candidate_educations`
--
ALTER TABLE `candidate_educations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `candidate_experiences`
--
ALTER TABLE `candidate_experiences`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `candidate_language`
--
ALTER TABLE `candidate_language`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `candidate_skills`
--
ALTER TABLE `candidate_skills`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `career_levels`
--
ALTER TABLE `career_levels`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `cities`
--
ALTER TABLE `cities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48357;

--
-- AUTO_INCREMENT de la tabla `cms_services`
--
ALTER TABLE `cms_services`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `company_sizes`
--
ALTER TABLE `company_sizes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `countries`
--
ALTER TABLE `countries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=247;

--
-- AUTO_INCREMENT de la tabla `email_jobs`
--
ALTER TABLE `email_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `email_templates`
--
ALTER TABLE `email_templates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `favourite_companies`
--
ALTER TABLE `favourite_companies`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `favourite_jobs`
--
ALTER TABLE `favourite_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `featured_records`
--
ALTER TABLE `featured_records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `front_settings`
--
ALTER TABLE `front_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `functional_areas`
--
ALTER TABLE `functional_areas`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `header_sliders`
--
ALTER TABLE `header_sliders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `image_sliders`
--
ALTER TABLE `image_sliders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `industries`
--
ALTER TABLE `industries`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `inquiries`
--
ALTER TABLE `inquiries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `jobs_alerts`
--
ALTER TABLE `jobs_alerts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `jobs_skill`
--
ALTER TABLE `jobs_skill`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `jobs_tag`
--
ALTER TABLE `jobs_tag`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `job_applications`
--
ALTER TABLE `job_applications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `job_application_schedules`
--
ALTER TABLE `job_application_schedules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `job_categories`
--
ALTER TABLE `job_categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `job_shifts`
--
ALTER TABLE `job_shifts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `job_stages`
--
ALTER TABLE `job_stages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `job_types`
--
ALTER TABLE `job_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `languages`
--
ALTER TABLE `languages`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `marital_status`
--
ALTER TABLE `marital_status`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `media`
--
ALTER TABLE `media`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT de la tabla `news_letters`
--
ALTER TABLE `news_letters`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `noticeboards`
--
ALTER TABLE `noticeboards`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notification_settings`
--
ALTER TABLE `notification_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `ownership_types`
--
ALTER TABLE `ownership_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `plans`
--
ALTER TABLE `plans`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `post_assigned_categories`
--
ALTER TABLE `post_assigned_categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `post_categories`
--
ALTER TABLE `post_categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `post_comments`
--
ALTER TABLE `post_comments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reported_jobs`
--
ALTER TABLE `reported_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reported_to_candidates`
--
ALTER TABLE `reported_to_candidates`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reported_to_companies`
--
ALTER TABLE `reported_to_companies`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `required_degree_levels`
--
ALTER TABLE `required_degree_levels`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `salary_currencies`
--
ALTER TABLE `salary_currencies`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=136;

--
-- AUTO_INCREMENT de la tabla `salary_periods`
--
ALTER TABLE `salary_periods`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `social_accounts`
--
ALTER TABLE `social_accounts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `states`
--
ALTER TABLE `states`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4122;

--
-- AUTO_INCREMENT de la tabla `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `subscription_items`
--
ALTER TABLE `subscription_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `testimonials`
--
ALTER TABLE `testimonials`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `candidates`
--
ALTER TABLE `candidates`
  ADD CONSTRAINT `candidates_career_level_id_foreign` FOREIGN KEY (`career_level_id`) REFERENCES `career_levels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `candidates_functional_area_id_foreign` FOREIGN KEY (`functional_area_id`) REFERENCES `functional_areas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `candidates_industry_id_foreign` FOREIGN KEY (`industry_id`) REFERENCES `industries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `candidates_last_change_foreign` FOREIGN KEY (`last_change`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `candidates_marital_status_id_foreign` FOREIGN KEY (`marital_status_id`) REFERENCES `marital_status` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `candidates_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `candidate_educations`
--
ALTER TABLE `candidate_educations`
  ADD CONSTRAINT `candidate_educations_candidate_id_foreign` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `candidate_educations_city_id_foreign` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `candidate_educations_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `candidate_educations_degree_level_id_foreign` FOREIGN KEY (`degree_level_id`) REFERENCES `required_degree_levels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `candidate_educations_state_id_foreign` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `candidate_experiences`
--
ALTER TABLE `candidate_experiences`
  ADD CONSTRAINT `candidate_experiences_candidate_id_foreign` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `candidate_experiences_city_id_foreign` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `candidate_experiences_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `candidate_experiences_state_id_foreign` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `candidate_language`
--
ALTER TABLE `candidate_language`
  ADD CONSTRAINT `candidate_language_language_id_foreign` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `candidate_language_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `candidate_skills`
--
ALTER TABLE `candidate_skills`
  ADD CONSTRAINT `candidate_skills_skill_id_foreign` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `candidate_skills_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `cities`
--
ALTER TABLE `cities`
  ADD CONSTRAINT `cities_state_id_foreign` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_company_size_id_foreign` FOREIGN KEY (`company_size_id`) REFERENCES `company_sizes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `companies_industry_id_foreign` FOREIGN KEY (`industry_id`) REFERENCES `industries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `companies_last_change_foreign` FOREIGN KEY (`last_change`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `companies_ownership_type_id_foreign` FOREIGN KEY (`ownership_type_id`) REFERENCES `ownership_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `companies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `email_jobs`
--
ALTER TABLE `email_jobs`
  ADD CONSTRAINT `email_jobs_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `email_jobs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `favourite_companies`
--
ALTER TABLE `favourite_companies`
  ADD CONSTRAINT `favourite_companies_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `favourite_companies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `favourite_jobs`
--
ALTER TABLE `favourite_jobs`
  ADD CONSTRAINT `favourite_jobs_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `favourite_jobs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `featured_records`
--
ALTER TABLE `featured_records`
  ADD CONSTRAINT `featured_records_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `jobs`
--
ALTER TABLE `jobs`
  ADD CONSTRAINT `jobs_career_level_id_foreign` FOREIGN KEY (`career_level_id`) REFERENCES `career_levels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `jobs_city_id_foreign` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `jobs_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `jobs_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `jobs_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `salary_currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `jobs_degree_level_id_foreign` FOREIGN KEY (`degree_level_id`) REFERENCES `required_degree_levels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `jobs_functional_area_id_foreign` FOREIGN KEY (`functional_area_id`) REFERENCES `functional_areas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `jobs_job_category_id_foreign` FOREIGN KEY (`job_category_id`) REFERENCES `job_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `jobs_job_shift_id_foreign` FOREIGN KEY (`job_shift_id`) REFERENCES `job_shifts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `jobs_job_type_id_foreign` FOREIGN KEY (`job_type_id`) REFERENCES `job_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `jobs_last_change_foreign` FOREIGN KEY (`last_change`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `jobs_salary_period_id_foreign` FOREIGN KEY (`salary_period_id`) REFERENCES `salary_periods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `jobs_state_id_foreign` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `jobs_alerts`
--
ALTER TABLE `jobs_alerts`
  ADD CONSTRAINT `jobs_alerts_candidate_id_foreign` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `jobs_alerts_job_type_id_foreign` FOREIGN KEY (`job_type_id`) REFERENCES `job_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `jobs_skill`
--
ALTER TABLE `jobs_skill`
  ADD CONSTRAINT `jobs_skill_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `jobs_skill_skill_id_foreign` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `jobs_tag`
--
ALTER TABLE `jobs_tag`
  ADD CONSTRAINT `jobs_tag_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `jobs_tag_tag_id_foreign` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `job_applications`
--
ALTER TABLE `job_applications`
  ADD CONSTRAINT `job_applications_candidate_id_foreign` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `job_applications_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `job_applications_job_stage_id_foreign` FOREIGN KEY (`job_stage_id`) REFERENCES `job_stages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `job_application_schedules`
--
ALTER TABLE `job_application_schedules`
  ADD CONSTRAINT `job_application_schedules_job_application_id_foreign` FOREIGN KEY (`job_application_id`) REFERENCES `job_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `job_application_schedules_stage_id_foreign` FOREIGN KEY (`stage_id`) REFERENCES `job_stages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `job_stages`
--
ALTER TABLE `job_stages`
  ADD CONSTRAINT `job_stages_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `post_assigned_categories`
--
ALTER TABLE `post_assigned_categories`
  ADD CONSTRAINT `post_assigned_categories_post_categories_id_foreign` FOREIGN KEY (`post_categories_id`) REFERENCES `post_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `post_assigned_categories_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `post_comments`
--
ALTER TABLE `post_comments`
  ADD CONSTRAINT `post_comments_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `post_comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `reported_jobs`
--
ALTER TABLE `reported_jobs`
  ADD CONSTRAINT `reported_jobs_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reported_jobs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `reported_to_candidates`
--
ALTER TABLE `reported_to_candidates`
  ADD CONSTRAINT `reported_to_candidates_candidate_id_foreign` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reported_to_candidates_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `reported_to_companies`
--
ALTER TABLE `reported_to_companies`
  ADD CONSTRAINT `reported_to_companies_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reported_to_companies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `social_accounts`
--
ALTER TABLE `social_accounts`
  ADD CONSTRAINT `social_accounts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `states`
--
ALTER TABLE `states`
  ADD CONSTRAINT `states_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_approved_id_foreign` FOREIGN KEY (`approved_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_city_id_foreign` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_state_id_foreign` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
