--
-- PostgreSQL database dump
--

\restrict U7mdTceknxs5UIoPLtq0OoauKwkoFjEhh5vPE9wSuzgoRlZTWojuMpLpr93mZ14

-- Dumped from database version 14.20 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: pmk
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(255) NOT NULL,
    entity_type character varying(255) NOT NULL,
    entity_id integer,
    changes json,
    ip_address character varying(255),
    details text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO pmk;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: pmk
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audit_logs_id_seq OWNER TO pmk;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pmk
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: dealers; Type: TABLE; Schema: public; Owner: pmk
--

CREATE TABLE public.dealers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255),
    email character varying(255),
    address text NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    farm_size numeric(10,2) NOT NULL,
    species character varying(255) NOT NULL,
    territory_id integer,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.dealers OWNER TO pmk;

--
-- Name: dealers_id_seq; Type: SEQUENCE; Schema: public; Owner: pmk
--

CREATE SEQUENCE public.dealers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dealers_id_seq OWNER TO pmk;

--
-- Name: dealers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pmk
--

ALTER SEQUENCE public.dealers_id_seq OWNED BY public.dealers.id;


--
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: pmk
--

CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


ALTER TABLE public.knex_migrations OWNER TO pmk;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: pmk
--

CREATE SEQUENCE public.knex_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knex_migrations_id_seq OWNER TO pmk;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pmk
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: pmk
--

CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);


ALTER TABLE public.knex_migrations_lock OWNER TO pmk;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: pmk
--

CREATE SEQUENCE public.knex_migrations_lock_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knex_migrations_lock_index_seq OWNER TO pmk;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pmk
--

ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: pmk
--

CREATE TABLE public.password_resets (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_resets OWNER TO pmk;

--
-- Name: password_resets_id_seq; Type: SEQUENCE; Schema: public; Owner: pmk
--

CREATE SEQUENCE public.password_resets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.password_resets_id_seq OWNER TO pmk;

--
-- Name: password_resets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pmk
--

ALTER SEQUENCE public.password_resets_id_seq OWNED BY public.password_resets.id;


--
-- Name: sync_queue; Type: TABLE; Schema: public; Owner: pmk
--

CREATE TABLE public.sync_queue (
    id integer NOT NULL,
    user_id integer,
    entity_type character varying(255) NOT NULL,
    entity_id integer NOT NULL,
    operation character varying(255) NOT NULL,
    data json NOT NULL,
    status text DEFAULT 'pending'::text,
    retry_count integer DEFAULT 0,
    error_message text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    synced_at timestamp with time zone,
    CONSTRAINT sync_queue_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'syncing'::text, 'completed'::text, 'failed'::text])))
);


ALTER TABLE public.sync_queue OWNER TO pmk;

--
-- Name: sync_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: pmk
--

CREATE SEQUENCE public.sync_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sync_queue_id_seq OWNER TO pmk;

--
-- Name: sync_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pmk
--

ALTER SEQUENCE public.sync_queue_id_seq OWNED BY public.sync_queue.id;


--
-- Name: territories; Type: TABLE; Schema: public; Owner: pmk
--

CREATE TABLE public.territories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    polygon_coordinates json,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.territories OWNER TO pmk;

--
-- Name: territories_id_seq; Type: SEQUENCE; Schema: public; Owner: pmk
--

CREATE SEQUENCE public.territories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.territories_id_seq OWNER TO pmk;

--
-- Name: territories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pmk
--

ALTER SEQUENCE public.territories_id_seq OWNED BY public.territories.id;


--
-- Name: tracking_locations; Type: TABLE; Schema: public; Owner: pmk
--

CREATE TABLE public.tracking_locations (
    id integer NOT NULL,
    user_id integer,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    accuracy numeric(10,2),
    speed numeric(10,2),
    heading numeric(5,2),
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tracking_locations OWNER TO pmk;

--
-- Name: tracking_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: pmk
--

CREATE SEQUENCE public.tracking_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tracking_locations_id_seq OWNER TO pmk;

--
-- Name: tracking_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pmk
--

ALTER SEQUENCE public.tracking_locations_id_seq OWNED BY public.tracking_locations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: pmk
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role text DEFAULT 'rep'::text NOT NULL,
    territory_id integer,
    is_active boolean DEFAULT true,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    sales_target numeric(10,2),
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['super_admin'::text, 'manager'::text, 'rep'::text])))
);


ALTER TABLE public.users OWNER TO pmk;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: pmk
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO pmk;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pmk
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: visits; Type: TABLE; Schema: public; Owner: pmk
--

CREATE TABLE public.visits (
    id integer NOT NULL,
    dealer_id integer,
    rep_id integer,
    visit_type text NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone,
    start_latitude numeric(10,8),
    start_longitude numeric(11,8),
    end_latitude numeric(10,8),
    end_longitude numeric(11,8),
    notes text,
    photos json,
    is_synced boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'pending'::text,
    manager_verified boolean DEFAULT false,
    sale_completed boolean DEFAULT false,
    CONSTRAINT visits_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'denied'::text, 'hold'::text, 'accepted'::text]))),
    CONSTRAINT visits_visit_type_check CHECK ((visit_type = ANY (ARRAY['demo'::text, 'sale'::text, 'inspect'::text, 'field'::text])))
);


ALTER TABLE public.visits OWNER TO pmk;

--
-- Name: visits_id_seq; Type: SEQUENCE; Schema: public; Owner: pmk
--

CREATE SEQUENCE public.visits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.visits_id_seq OWNER TO pmk;

--
-- Name: visits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pmk
--

ALTER SEQUENCE public.visits_id_seq OWNED BY public.visits.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: dealers id; Type: DEFAULT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.dealers ALTER COLUMN id SET DEFAULT nextval('public.dealers_id_seq'::regclass);


--
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- Name: password_resets id; Type: DEFAULT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.password_resets ALTER COLUMN id SET DEFAULT nextval('public.password_resets_id_seq'::regclass);


--
-- Name: sync_queue id; Type: DEFAULT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.sync_queue ALTER COLUMN id SET DEFAULT nextval('public.sync_queue_id_seq'::regclass);


--
-- Name: territories id; Type: DEFAULT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.territories ALTER COLUMN id SET DEFAULT nextval('public.territories_id_seq'::regclass);


--
-- Name: tracking_locations id; Type: DEFAULT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.tracking_locations ALTER COLUMN id SET DEFAULT nextval('public.tracking_locations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: visits id; Type: DEFAULT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.visits ALTER COLUMN id SET DEFAULT nextval('public.visits_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: pmk
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, changes, ip_address, details, created_at) FROM stdin;
138	32	login	user	32	\N	::1	\N	2025-12-09 11:49:58.230696+05:30
139	32	create	territory	28	{"data":{"name":"Alliance ","description":"Alliance University","polygon_coordinates":"[\\r\\n  {\\r\\n    \\"lat\\": 12.732669515410125,\\r\\n    \\"lng\\": 77.70787388844236\\r\\n  },\\r\\n  {\\r\\n    \\"lat\\": 12.732669515410125,\\r\\n    \\"lng\\": 77.7095905022119\\r\\n  },\\r\\n  {\\r\\n    \\"lat\\": 12.731455572088391,\\r\\n    \\"lng\\": 77.7104917244409\\r\\n  },\\r\\n  {\\r\\n    \\"lat\\": 12.729802088215932,\\r\\n    \\"lng\\": 77.7091398910974\\r\\n  },\\r\\n  {\\r\\n    \\"lat\\": 12.729938134764332,\\r\\n    \\"lng\\": 77.70654351277098\\r\\n  }\\r\\n]","is_active":"true"}}	::1	\N	2025-12-09 11:50:37.393574+05:30
140	32	create	dealer	28	{"data":{"name":"Syed Sameer","phone":"7330644650","email":"khan.for.college@gmail.com","address":"Alliance","latitude":"12.731432","longitude":"77.708159","farm_size":"10","species":"catfish","territory_id":"28","notes":""}}	::1	\N	2025-12-09 11:51:15.382875+05:30
141	32	login	user	32	\N	::1	\N	2025-12-09 11:55:09.270496+05:30
142	32	create	user	36	{"data":{"first_name":"Syed","last_name":"Sameer","email":"sammer@gmail.com","password":"1234","role":"rep","territory_id":"28","sales_target":"10","is_active":"true"}}	::1	\N	2025-12-09 11:55:31.720364+05:30
143	32	login	user	32	\N	::1	\N	2025-12-09 13:50:51.032423+05:30
144	32	login	user	32	\N	::1	\N	2025-12-09 21:29:09.619206+05:30
145	32	create	user	37	{"data":{"first_name":"Musthakheem","last_name":"Khan","email":"khan.for.college@gmail.com","password":"1234","role":"manager","territory_id":"28","sales_target":"","is_active":"true"}}	::1	\N	2025-12-09 21:29:34.372371+05:30
\.


--
-- Data for Name: dealers; Type: TABLE DATA; Schema: public; Owner: pmk
--

COPY public.dealers (id, name, phone, email, address, latitude, longitude, farm_size, species, territory_id, notes, created_at, updated_at) FROM stdin;
25	ABC Farm	+1 (555) 123-4567	abc.farm@example.com	123 Farm Road, City, State 12345	40.71280000	-74.00600000	25.00	tilapia	25	Regular dealer with consistent orders. Prefers morning visits.	2025-12-09 11:49:08.928824+05:30	2025-12-09 11:49:08.928824+05:30
26	XYZ Aquaculture	+1 (555) 987-6543	xyz@example.com	456 Lake Street, City, State 12345	34.05220000	-118.24370000	45.00	catfish	26	Large operation, requires regular monitoring.	2025-12-09 11:49:08.928824+05:30	2025-12-09 11:49:08.928824+05:30
27	Coastal Fisheries	+1 (555) 555-5555	coastal@example.com	789 Ocean Drive, City, State 12345	29.76040000	-95.36980000	60.00	salmon	27	Premium quality producer.	2025-12-09 11:49:08.928824+05:30	2025-12-09 11:49:08.928824+05:30
28	Syed Sameer	7330644650	khan.for.college@gmail.com	Alliance	12.73143200	77.70815900	10.00	catfish	28	\N	2025-12-09 11:51:15.380495+05:30	2025-12-09 11:51:15.380495+05:30
\.


--
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: pmk
--

COPY public.knex_migrations (id, name, batch, migration_time) FROM stdin;
1	001_create_territories.js	1	2025-12-02 11:51:53.646+05:30
2	002_create_users.js	1	2025-12-02 11:51:53.662+05:30
3	003_create_dealers.js	1	2025-12-02 11:51:53.669+05:30
4	004_create_visits.js	1	2025-12-02 11:51:53.681+05:30
5	005_create_audit_logs.js	1	2025-12-02 11:51:53.691+05:30
6	006_create_sync_queue.js	1	2025-12-02 11:51:53.701+05:30
7	007_create_tracking_locations.js	1	2025-12-02 11:51:53.707+05:30
8	008_create_password_resets.js	2	2025-12-02 21:44:34.669+05:30
10	009_update_visit_type_enum.js	3	2025-12-03 23:31:53.528+05:30
11	010_add_visit_status.js	4	2025-12-08 11:44:04.694+05:30
12	011_add_sales_target_to_users.js	5	2025-12-09 11:49:05.469+05:30
13	012_add_sale_completed_to_visits.js	5	2025-12-09 11:49:05.475+05:30
\.


--
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: pmk
--

COPY public.knex_migrations_lock (index, is_locked) FROM stdin;
1	0
\.


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: pmk
--

COPY public.password_resets (id, email, token, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: sync_queue; Type: TABLE DATA; Schema: public; Owner: pmk
--

COPY public.sync_queue (id, user_id, entity_type, entity_id, operation, data, status, retry_count, error_message, created_at, synced_at) FROM stdin;
\.


--
-- Data for Name: territories; Type: TABLE DATA; Schema: public; Owner: pmk
--

COPY public.territories (id, name, description, polygon_coordinates, is_active, created_at, updated_at) FROM stdin;
25	North Region	Northern region covering major aquaculture farms	\N	t	2025-12-09 11:49:08.846084+05:30	2025-12-09 11:49:08.846084+05:30
26	South Region	Southern region with diverse farming operations	\N	t	2025-12-09 11:49:08.846084+05:30	2025-12-09 11:49:08.846084+05:30
27	East Region	Eastern coastal region	\N	t	2025-12-09 11:49:08.846084+05:30	2025-12-09 11:49:08.846084+05:30
28	Alliance 	Alliance University	[{"lat":12.732669515410125,"lng":77.70787388844236},{"lat":12.732669515410125,"lng":77.7095905022119},{"lat":12.731455572088391,"lng":77.7104917244409},{"lat":12.729802088215932,"lng":77.7091398910974},{"lat":12.729938134764332,"lng":77.70654351277098}]	t	2025-12-09 11:50:37.39042+05:30	2025-12-09 11:50:37.39042+05:30
\.


--
-- Data for Name: tracking_locations; Type: TABLE DATA; Schema: public; Owner: pmk
--

COPY public.tracking_locations (id, user_id, latitude, longitude, accuracy, speed, heading, "timestamp") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: pmk
--

COPY public.users (id, first_name, last_name, email, password_hash, role, territory_id, is_active, last_login, created_at, updated_at, sales_target) FROM stdin;
33	John	Doe	john.doe@aquaculture.com	$2a$10$BWXAIWyEgu1FeYJWgQSSM.2M23HPM7tp9Lgmb17f6usF8HpJfVIRG	manager	25	t	\N	2025-12-09 11:49:08.925573+05:30	2025-12-09 11:49:08.925573+05:30	\N
34	Jane	Smith	jane.smith@aquaculture.com	$2a$10$BWXAIWyEgu1FeYJWgQSSM.2M23HPM7tp9Lgmb17f6usF8HpJfVIRG	rep	26	t	\N	2025-12-09 11:49:08.925573+05:30	2025-12-09 11:49:08.925573+05:30	\N
35	Mike	Brown	mike.brown@aquaculture.com	$2a$10$BWXAIWyEgu1FeYJWgQSSM.2M23HPM7tp9Lgmb17f6usF8HpJfVIRG	rep	27	t	\N	2025-12-09 11:49:08.925573+05:30	2025-12-09 11:49:08.925573+05:30	\N
36	Syed	Sameer	sammer@gmail.com	$2a$10$QJ/0irENp6Hx3rWoikSNwueWWO0gY4lOJxI9UCzWpRe9vT2qaYKrS	rep	28	t	\N	2025-12-09 11:55:31.717008+05:30	2025-12-09 11:55:31.717008+05:30	10.00
32	Admin	User	patanmusthakheem456@gmail.com	$2a$10$BWXAIWyEgu1FeYJWgQSSM.2M23HPM7tp9Lgmb17f6usF8HpJfVIRG	super_admin	\N	t	2025-12-09 21:29:09.608221+05:30	2025-12-09 11:49:08.925573+05:30	2025-12-09 11:49:08.925573+05:30	\N
37	Musthakheem	Khan	khan.for.college@gmail.com	$2a$10$GxobaJ/9NH3y7ZVkWrcfkup5NmWO9QRQTixhtKL4dgTlSHR/hiL.6	manager	28	t	\N	2025-12-09 21:29:34.36792+05:30	2025-12-09 21:29:34.36792+05:30	\N
\.


--
-- Data for Name: visits; Type: TABLE DATA; Schema: public; Owner: pmk
--

COPY public.visits (id, dealer_id, rep_id, visit_type, start_time, end_time, start_latitude, start_longitude, end_latitude, end_longitude, notes, photos, is_synced, created_at, updated_at, status, manager_verified, sale_completed) FROM stdin;
24	25	33	demo	2025-12-07 11:49:08.93+05:30	2025-12-07 13:04:08.93+05:30	40.71280000	-74.00600000	40.71280000	-74.00600000	Conducted product demonstration for new feeding system. Dealer showed interest.	\N	t	2025-12-09 11:49:08.930872+05:30	2025-12-09 11:49:08.930872+05:30	pending	f	f
25	26	34	sale	2025-12-02 11:49:08.93+05:30	2025-12-02 13:19:08.93+05:30	34.05220000	-118.24370000	34.05220000	-118.24370000	Successful sale visit. Order placed.	\N	t	2025-12-09 11:49:08.930872+05:30	2025-12-09 11:49:08.930872+05:30	pending	f	f
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pmk
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 145, true);


--
-- Name: dealers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pmk
--

SELECT pg_catalog.setval('public.dealers_id_seq', 28, true);


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pmk
--

SELECT pg_catalog.setval('public.knex_migrations_id_seq', 13, true);


--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE SET; Schema: public; Owner: pmk
--

SELECT pg_catalog.setval('public.knex_migrations_lock_index_seq', 1, true);


--
-- Name: password_resets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pmk
--

SELECT pg_catalog.setval('public.password_resets_id_seq', 1, false);


--
-- Name: sync_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pmk
--

SELECT pg_catalog.setval('public.sync_queue_id_seq', 16, true);


--
-- Name: territories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pmk
--

SELECT pg_catalog.setval('public.territories_id_seq', 28, true);


--
-- Name: tracking_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pmk
--

SELECT pg_catalog.setval('public.tracking_locations_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pmk
--

SELECT pg_catalog.setval('public.users_id_seq', 37, true);


--
-- Name: visits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pmk
--

SELECT pg_catalog.setval('public.visits_id_seq', 25, true);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: dealers dealers_pkey; Type: CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT dealers_pkey PRIMARY KEY (id);


--
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_token_unique; Type: CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_token_unique UNIQUE (token);


--
-- Name: sync_queue sync_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.sync_queue
    ADD CONSTRAINT sync_queue_pkey PRIMARY KEY (id);


--
-- Name: territories territories_pkey; Type: CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.territories
    ADD CONSTRAINT territories_pkey PRIMARY KEY (id);


--
-- Name: tracking_locations tracking_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.tracking_locations
    ADD CONSTRAINT tracking_locations_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: visits visits_pkey; Type: CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_created_at_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX audit_logs_created_at_index ON public.audit_logs USING btree (created_at);


--
-- Name: audit_logs_entity_id_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX audit_logs_entity_id_index ON public.audit_logs USING btree (entity_id);


--
-- Name: audit_logs_entity_type_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX audit_logs_entity_type_index ON public.audit_logs USING btree (entity_type);


--
-- Name: audit_logs_user_id_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX audit_logs_user_id_index ON public.audit_logs USING btree (user_id);


--
-- Name: dealers_species_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX dealers_species_index ON public.dealers USING btree (species);


--
-- Name: dealers_territory_id_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX dealers_territory_id_index ON public.dealers USING btree (territory_id);


--
-- Name: password_resets_email_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX password_resets_email_index ON public.password_resets USING btree (email);


--
-- Name: sync_queue_created_at_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX sync_queue_created_at_index ON public.sync_queue USING btree (created_at);


--
-- Name: sync_queue_status_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX sync_queue_status_index ON public.sync_queue USING btree (status);


--
-- Name: sync_queue_user_id_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX sync_queue_user_id_index ON public.sync_queue USING btree (user_id);


--
-- Name: territories_name_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX territories_name_index ON public.territories USING btree (name);


--
-- Name: tracking_locations_timestamp_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX tracking_locations_timestamp_index ON public.tracking_locations USING btree ("timestamp");


--
-- Name: tracking_locations_user_id_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX tracking_locations_user_id_index ON public.tracking_locations USING btree (user_id);


--
-- Name: users_email_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX users_email_index ON public.users USING btree (email);


--
-- Name: users_role_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX users_role_index ON public.users USING btree (role);


--
-- Name: users_territory_id_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX users_territory_id_index ON public.users USING btree (territory_id);


--
-- Name: visits_dealer_id_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX visits_dealer_id_index ON public.visits USING btree (dealer_id);


--
-- Name: visits_rep_id_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX visits_rep_id_index ON public.visits USING btree (rep_id);


--
-- Name: visits_start_time_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX visits_start_time_index ON public.visits USING btree (start_time);


--
-- Name: visits_visit_type_index; Type: INDEX; Schema: public; Owner: pmk
--

CREATE INDEX visits_visit_type_index ON public.visits USING btree (visit_type);


--
-- Name: audit_logs audit_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: dealers dealers_territory_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT dealers_territory_id_foreign FOREIGN KEY (territory_id) REFERENCES public.territories(id) ON DELETE SET NULL;


--
-- Name: sync_queue sync_queue_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.sync_queue
    ADD CONSTRAINT sync_queue_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tracking_locations tracking_locations_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.tracking_locations
    ADD CONSTRAINT tracking_locations_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_territory_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_territory_id_foreign FOREIGN KEY (territory_id) REFERENCES public.territories(id) ON DELETE SET NULL;


--
-- Name: visits visits_dealer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_dealer_id_foreign FOREIGN KEY (dealer_id) REFERENCES public.dealers(id) ON DELETE CASCADE;


--
-- Name: visits visits_rep_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: pmk
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_rep_id_foreign FOREIGN KEY (rep_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict U7mdTceknxs5UIoPLtq0OoauKwkoFjEhh5vPE9wSuzgoRlZTWojuMpLpr93mZ14

