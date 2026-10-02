--
-- PostgreSQL database dump
--

\restrict WMoe40Y7fVFSmnEwgZHEROqrsdTfva9d3Jnd80OQNLeDpnufftJ4gSxt8eqLfAS

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

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

--
-- Name: trigger_set_timestamp(); Type: FUNCTION; Schema: public; Owner: user
--

CREATE FUNCTION public.trigger_set_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_set_timestamp() OWNER TO "user";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: artworks; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.artworks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    artist character varying(255) DEFAULT 'GABRIEL VF'::character varying,
    year character varying(50) DEFAULT '2026'::character varying,
    medium character varying(255) DEFAULT 'Technique mixte'::character varying,
    dimensions character varying(100) DEFAULT '21 x 29.7 cm'::character varying,
    description text,
    image_url character varying(500) NOT NULL,
    is_published boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.artworks OWNER TO "user";

--
-- Name: artworks_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.artworks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.artworks_id_seq OWNER TO "user";

--
-- Name: artworks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.artworks_id_seq OWNED BY public.artworks.id;


--
-- Name: audio_plays; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.audio_plays (
    id integer NOT NULL,
    visitor_uuid character varying(255) NOT NULL,
    ip character varying(100),
    track_id character varying(255) NOT NULL,
    track_title character varying(255) NOT NULL,
    track_artist character varying(255) DEFAULT 'Paguera'::character varying,
    playlist character varying(100) DEFAULT 'Général'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audio_plays OWNER TO "user";

--
-- Name: audio_plays_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.audio_plays_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audio_plays_id_seq OWNER TO "user";

--
-- Name: audio_plays_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.audio_plays_id_seq OWNED BY public.audio_plays.id;


--
-- Name: category; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.category (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.category OWNER TO "user";

--
-- Name: category_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.category_id_seq OWNER TO "user";

--
-- Name: category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.category_id_seq OWNED BY public.category.id;


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.contact_messages (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    subject character varying(255),
    message text NOT NULL,
    is_read boolean DEFAULT false,
    is_archived boolean DEFAULT false,
    ip character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.contact_messages OWNER TO "user";

--
-- Name: contact_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.contact_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contact_messages_id_seq OWNER TO "user";

--
-- Name: contact_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.contact_messages_id_seq OWNED BY public.contact_messages.id;


--
-- Name: page_views; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.page_views (
    id integer NOT NULL,
    visitor_uuid character varying(255) NOT NULL,
    path character varying(255) DEFAULT '/'::character varying NOT NULL,
    referrer character varying(500),
    browser character varying(50),
    os character varying(50),
    device character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    ip character varying(100)
);


ALTER TABLE public.page_views OWNER TO "user";

--
-- Name: page_views_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.page_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.page_views_id_seq OWNER TO "user";

--
-- Name: page_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.page_views_id_seq OWNED BY public.page_views.id;


--
-- Name: project_links; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.project_links (
    id integer NOT NULL,
    project_id integer NOT NULL,
    label character varying(100) NOT NULL,
    url character varying(500) NOT NULL
);


ALTER TABLE public.project_links OWNER TO "user";

--
-- Name: project_links_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.project_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_links_id_seq OWNER TO "user";

--
-- Name: project_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.project_links_id_seq OWNED BY public.project_links.id;


--
-- Name: project_technologies; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.project_technologies (
    project_id integer NOT NULL,
    technology_id integer NOT NULL
);


ALTER TABLE public.project_technologies OWNER TO "user";

--
-- Name: projects; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    title character varying(150) NOT NULL,
    description text NOT NULL,
    category_id integer,
    demo_url character varying(500),
    image_url character varying(500) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_published boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    content_markdown text DEFAULT ''::text,
    slug character varying(255),
    display_order integer DEFAULT 0
);


ALTER TABLE public.projects OWNER TO "user";

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects_id_seq OWNER TO "user";

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.site_settings (
    key character varying(100) NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.site_settings OWNER TO "user";

--
-- Name: technologies; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.technologies (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    icon_class character varying(100)
);


ALTER TABLE public.technologies OWNER TO "user";

--
-- Name: technologies_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.technologies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.technologies_id_seq OWNER TO "user";

--
-- Name: technologies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.technologies_id_seq OWNED BY public.technologies.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO "user";

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO "user";

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: visitors; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.visitors (
    id integer NOT NULL,
    visitor_uuid character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_visit_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    total_visits integer DEFAULT 1,
    ip character varying(100)
);


ALTER TABLE public.visitors OWNER TO "user";

--
-- Name: visitors_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.visitors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.visitors_id_seq OWNER TO "user";

--
-- Name: visitors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.visitors_id_seq OWNED BY public.visitors.id;


--
-- Name: artworks id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.artworks ALTER COLUMN id SET DEFAULT nextval('public.artworks_id_seq'::regclass);


--
-- Name: audio_plays id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.audio_plays ALTER COLUMN id SET DEFAULT nextval('public.audio_plays_id_seq'::regclass);


--
-- Name: category id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.category ALTER COLUMN id SET DEFAULT nextval('public.category_id_seq'::regclass);


--
-- Name: contact_messages id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.contact_messages ALTER COLUMN id SET DEFAULT nextval('public.contact_messages_id_seq'::regclass);


--
-- Name: page_views id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.page_views ALTER COLUMN id SET DEFAULT nextval('public.page_views_id_seq'::regclass);


--
-- Name: project_links id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.project_links ALTER COLUMN id SET DEFAULT nextval('public.project_links_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: technologies id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.technologies ALTER COLUMN id SET DEFAULT nextval('public.technologies_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: visitors id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.visitors ALTER COLUMN id SET DEFAULT nextval('public.visitors_id_seq'::regclass);


--
-- Data for Name: artworks; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.artworks (id, title, artist, year, medium, dimensions, description, image_url, is_published, display_order, created_at, updated_at) FROM stdin;
1	Le Commencement du Chaos	GABRIEL VF	2026	Encre et graphite sur papier d'art	21 x 29.7 cm	Première esquisse d'une série explorant l'équilibre délicat entre la pureté du trait et la saleté de la tâche.	/dessins-salepropre/01.webp	t	1	2026-09-26 19:11:05.562977+00	2026-09-26 19:11:05.562977+00
2	Traversée Linéaire	GABRIEL VF	2026	Encre de Chine	21 x 29.7 cm	Une longue ligne ininterrompue qui dessine les contours d'une pensée invisible et mouvante.	/dessins-salepropre/06.webp	t	2	2026-09-26 19:11:05.611982+00	2026-09-26 19:11:05.611982+00
3	Vortex Spatial	GABRIEL VF	2026	Encre et graphite	21 x 29.7 cm	Exploration des dynamiques de rotation et de perspective.	/dessins-salepropre/07.webp	t	3	2026-09-26 19:11:05.619847+00	2026-09-26 19:11:05.619847+00
4	Structure Organique	GABRIEL VF	2026	Technique mixte	21 x 29.7 cm	Dessin texturé évoquant les formes de la vie microscopique.	/dessins-salepropre/08.webp	t	4	2026-09-26 19:11:05.628135+00	2026-09-26 19:11:05.628135+00
5	L'Empreinte Propre	GABRIEL VF	2026	Encre et graphite	21 x 29.7 cm	Laisser la marque de l'outil s'exprimer sans filtre. Un équilibre parfait entre propreté et rugosité.	/dessins-salepropre/1.webp	t	5	2026-09-26 19:11:05.636425+00	2026-09-26 19:11:05.636425+00
6	Érosion de Matière	GABRIEL VF	2026	Encre diluée et fusain	21 x 29.7 cm	Évocation du passage du temps sur la matière. Les noirs s'estompent et se dissolvent.	/dessins-salepropre/30.webp	t	6	2026-09-26 19:11:05.644895+00	2026-09-26 19:11:05.644895+00
7	Sans titre	GABRIEL VF	2026	Technique mixte	21 x 29.7 cm	Œuvre sans titre.	/dessins-salepropre/sans-titre.webp	t	7	2026-09-26 19:11:05.653141+00	2026-09-26 19:11:05.653141+00
9	GALACTIC VACCUM CLEANER	PAGUERA	2026	Technique mixte	21 x 29.7 cm		/uploads/1790602894474-6276caaffa2f1bd11fa77c6d1390a3c5.png	t	8	2026-09-28 13:41:58.412622+00	2026-09-28 13:41:58.412622+00
\.


--
-- Data for Name: audio_plays; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.audio_plays (id, visitor_uuid, ip, track_id, track_title, track_artist, playlist, created_at) FROM stdin;
1	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-0-100 PAS.ogg	100 PAS	Paguera	Général	2026-09-26 15:38:57.886752+00
2	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-4-C'mon to the crispy mountain Charlie.ogg	C'mon to the crispy mountain Charlie	Paguera	Général	2026-09-26 15:39:39.765587+00
3	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-2-Autre.ogg	Autre	Paguera	Général	2026-09-26 15:39:40.927292+00
4	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-4-C'mon to the crispy mountain Charlie.ogg	C'mon to the crispy mountain Charlie	Paguera	Général	2026-09-26 15:39:52.135024+00
5	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-21-Toute incapacité à travailler demain ou à articuler sera imputée à votre toxicomanie indubitable..ogg	Toute incapacité à travailler demain ou à articuler sera imputée à votre toxicomanie indubitable.	Paguera	Général	2026-09-26 15:39:58.446046+00
6	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-22-VDM.ogg	VDM	Paguera	Général	2026-09-26 15:44:06.306387+00
7	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-23-braco.ogg	braco	Paguera	Général	2026-09-26 15:44:14.054841+00
8	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-24-chacha plugin.ogg	chacha plugin	Paguera	Général	2026-09-26 15:44:15.130017+00
9	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-25-fair tell no blabla.ogg	fair tell no blabla	Paguera	Général	2026-09-26 15:44:16.04433+00
10	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-26-foireAuxVins.ogg	foireAuxVins	Paguera	Général	2026-09-26 15:44:18.745257+00
11	e35a96d3-ef0b-4b33-8cf5-88733eea4765	78.113.235.105	root-8-Last knight.ogg	Last knight	Paguera	Général	2026-09-26 15:57:00.605326+00
12	e35a96d3-ef0b-4b33-8cf5-88733eea4765	78.113.235.105	root-10-My Zombie Track.ogg	My Zombie Track	Paguera	Général	2026-09-26 15:57:09.518195+00
13	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-26-foireAuxVins.ogg	foireAuxVins	Paguera	Général	2026-09-26 18:10:16.538405+00
14	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Core ]-0-Autre.ogg	Autre	Paguera	[ Core ]	2026-09-26 18:23:54.891273+00
15	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-1-Toute incapacité à travailler demain ou à articuler sera imputée à votre toxicomanie indubitable..ogg	Toute incapacité à travailler demain ou à articuler sera imputée à votre toxicomanie indubitable.	Paguera	[ Acid ]	2026-09-26 18:24:16.762483+00
16	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Core ]-0-Autre.ogg	Autre	Paguera	[ Core ]	2026-09-26 18:24:49.069138+00
17	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Core ]-2-chacha plugin.ogg	chacha plugin	Paguera	[ Core ]	2026-09-26 18:25:39.795324+00
18	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-1-Toute incapacité à travailler demain ou à articuler sera imputée à votre toxicomanie indubitable..ogg	Toute incapacité à travailler demain ou à articuler sera imputée à votre toxicomanie indubitable.	Paguera	[ Acid ]	2026-09-26 18:25:54.505469+00
19	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-2-pin pon.ogg	pin pon	Paguera	[ Acid ]	2026-09-26 18:30:02.405883+00
20	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-0-Meloptique.ogg	Meloptique	Paguera	[ Acid ]	2026-09-26 18:30:13.703786+00
21	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-1-Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets.ogg	Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets	Paguera	[ Acid ]	2026-09-26 18:30:17.027138+00
22	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-0-100 PAS.ogg	100 PAS	Paguera	[ Psy - Goa - Full On]	2026-09-26 18:34:25.603425+00
23	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-1-Hero.ogg	Hero	Paguera	[ Psy - Goa - Full On]	2026-09-26 18:34:30.191138+00
24	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-2-Now is Tumorrow.ogg	Now is Tumorrow	Paguera	[ Psy - Goa - Full On]	2026-09-26 18:34:31.885229+00
25	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-3-fair tell no blabla.ogg	fair tell no blabla	Paguera	[ Psy - Goa - Full On]	2026-09-26 18:39:49.924519+00
26	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-0-100 PAS.ogg	100 PAS	Paguera	[ Psy - Goa - Full On]	2026-09-26 18:43:14.29778+00
27	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-1-Hero.ogg	Hero	Paguera	[ Psy - Goa - Full On]	2026-09-26 18:50:03.666697+00
28	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-2-Now is Tumorrow.ogg	Now is Tumorrow	Paguera	[ Psy - Goa - Full On]	2026-09-26 18:57:14.045874+00
29	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-3-fair tell no blabla.ogg	fair tell no blabla	Paguera	[ Psy - Goa - Full On]	2026-09-26 19:02:31.681773+00
30	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-0-100 PAS.ogg	100 PAS	Paguera	[ Psy - Goa - Full On]	2026-09-26 19:05:55.385881+00
31	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-8-Inside my phone.ogg	Inside my phone	Paguera	Général	2026-09-26 19:06:25.690039+00
32	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-9-So Are You .ogg	So Are You 	Paguera	Général	2026-09-26 19:07:28.563959+00
33	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-8-Inside my phone.ogg	Inside my phone	Paguera	Général	2026-09-26 19:10:36.859176+00
34	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-9-So Are You .ogg	So Are You 	Paguera	Général	2026-09-26 19:11:39.578599+00
35	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-8-Inside my phone.ogg	Inside my phone	Paguera	Général	2026-09-26 19:14:47.668807+00
36	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-0-Meloptique.ogg	Meloptique	Paguera	[ Acid ]	2026-09-26 19:15:04.428934+00
37	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-1-Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets.ogg	Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets	Paguera	[ Acid ]	2026-09-26 19:21:29.005226+00
38	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-2-pin pon.ogg	pin pon	Paguera	[ Acid ]	2026-09-26 19:25:36.644683+00
39	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Core ]-0-OKLM.ogg	OKLM	Paguera	[ Core ]	2026-09-26 19:31:06.878336+00
40	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Core ]-1-Serious Damage.ogg	Serious Damage	Paguera	[ Core ]	2026-09-26 19:37:46.72219+00
41	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-1-Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets.ogg	Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets	Paguera	[ Acid ]	2026-09-26 19:41:56.540901+00
42	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-2-pin pon.ogg	pin pon	Paguera	[ Acid ]	2026-09-26 19:46:04.42475+00
43	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Core ]-0-OKLM.ogg	OKLM	Paguera	[ Core ]	2026-09-26 19:51:34.751539+00
44	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Core ]-1-Serious Damage.ogg	Serious Damage	Paguera	[ Core ]	2026-09-26 19:58:13.590861+00
45	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Core ]-2-chacha plugin.ogg	chacha plugin	Paguera	[ Core ]	2026-09-26 20:03:34.437727+00
46	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Electronic ]-0-Autre.ogg	Autre	Paguera	[ Electronic ]	2026-09-26 20:09:00.738618+00
47	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Electronic ]-1-C'mon to the crispy mountain Charlie.ogg	C'mon to the crispy mountain Charlie	Paguera	[ Electronic ]	2026-09-26 20:17:55.614135+00
48	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Electronic ]-2-I Love Crying.ogg	I Love Crying	Paguera	[ Electronic ]	2026-09-26 20:21:38.685063+00
49	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Electronic ]-3-Last knight.ogg	Last knight	Paguera	[ Electronic ]	2026-09-26 20:26:36.480476+00
50	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Electronic ]-5-foireAuxVins.ogg	foireAuxVins	Paguera	[ Electronic ]	2026-09-26 20:26:49.15937+00
51	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Hip-Hop ]-0-Résillience.ogg	Résillience	Paguera	[ Hip-Hop ]	2026-09-26 20:33:14.018085+00
52	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Hip-Hop ]-1-VDM.ogg	VDM	Paguera	[ Hip-Hop ]	2026-09-26 20:36:08.925287+00
53	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Hip-Hop ]-2-braco.ogg	braco	Paguera	[ Hip-Hop ]	2026-09-26 20:39:56.604753+00
54	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Hitech ]-0-My Zombie Track.ogg	My Zombie Track	Paguera	[ Hitech ]	2026-09-26 20:45:51.647569+00
55	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Hitech ]-1-Om.ogg	Om	Paguera	[ Hitech ]	2026-09-26 20:57:41.479525+00
56	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Hitech ]-2-Tadaaaa.ogg	Tadaaaa	Paguera	[ Hitech ]	2026-09-26 21:04:05.758521+00
57	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ OST ]-0-Photosplasmique.ogg	Photosplasmique	Paguera	[ OST ]	2026-09-26 21:07:51.018695+00
58	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ OST ]-1-mad soul.ogg	mad soul	Paguera	[ OST ]	2026-09-26 21:12:56.966764+00
59	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-0-100 PAS.ogg	100 PAS	Paguera	[ Psy - Goa - Full On]	2026-09-26 21:17:47.198237+00
60	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-1-Hero.ogg	Hero	Paguera	[ Psy - Goa - Full On]	2026-09-26 21:24:36.551707+00
61	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-2-Now is Tumorrow.ogg	Now is Tumorrow	Paguera	[ Psy - Goa - Full On]	2026-09-26 21:31:46.908018+00
62	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-3-fair tell no blabla.ogg	fair tell no blabla	Paguera	[ Psy - Goa - Full On]	2026-09-26 21:37:04.29617+00
63	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Reggea ]-0-AloneTogether.ogg	AloneTogether	Paguera	[ Reggea ]	2026-09-26 21:40:28.300357+00
64	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Reggea ]-1-Blob.ogg	Blob	Paguera	[ Reggea ]	2026-09-26 21:43:23.881158+00
65	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Reggea ]-2-Please wake up.ogg	Please wake up	Paguera	[ Reggea ]	2026-09-26 21:47:18.180616+00
66	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-8-Inside my phone.ogg	Inside my phone	Paguera	Général	2026-09-26 21:55:56.143255+00
67	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	root-9-So Are You .ogg	So Are You 	Paguera	Général	2026-09-26 21:56:58.893493+00
68	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-0-Meloptique.ogg	Meloptique	Paguera	[ Acid ]	2026-09-26 22:00:06.888042+00
69	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-1-Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets.ogg	Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets	Paguera	[ Acid ]	2026-09-26 22:06:30.937217+00
70	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-2-pin pon.ogg	pin pon	Paguera	[ Acid ]	2026-09-26 22:10:38.695201+00
71	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Core ]-0-OKLM.ogg	OKLM	Paguera	[ Core ]	2026-09-26 22:16:09.06614+00
72	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Core ]-1-Serious Damage.ogg	Serious Damage	Paguera	[ Core ]	2026-09-26 22:22:47.829369+00
73	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Core ]-2-chacha plugin.ogg	chacha plugin	Paguera	[ Core ]	2026-09-26 22:28:08.556654+00
74	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Electronic ]-0-Autre.ogg	Autre	Paguera	[ Electronic ]	2026-09-26 22:33:34.875507+00
75	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Electronic ]-1-C'mon to the crispy mountain Charlie.ogg	C'mon to the crispy mountain Charlie	Paguera	[ Electronic ]	2026-09-26 22:42:29.041977+00
76	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Electronic ]-2-I Love Crying.ogg	I Love Crying	Paguera	[ Electronic ]	2026-09-26 22:46:11.576445+00
77	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Electronic ]-3-Last knight.ogg	Last knight	Paguera	[ Electronic ]	2026-09-26 22:51:08.923712+00
78	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Electronic ]-4-Proprement dégoûtant.ogg	Proprement dégoûtant	Paguera	[ Electronic ]	2026-09-26 22:54:33.996251+00
79	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Electronic ]-5-foireAuxVins.ogg	foireAuxVins	Paguera	[ Electronic ]	2026-09-26 22:59:27.484241+00
80	e35a96d3-ef0b-4b33-8cf5-88733eea4765	78.113.235.105	root-9-So Are You .ogg	So Are You 	Paguera	Général	2026-09-27 18:46:54.883682+00
81	e35a96d3-ef0b-4b33-8cf5-88733eea4765	78.113.235.105	folder-[ Acid ]-1-Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets.ogg	Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets	Paguera	[ Acid ]	2026-09-27 18:50:51.174495+00
82	e35a96d3-ef0b-4b33-8cf5-88733eea4765	78.113.235.105	folder-[ Electronic ]-0-Autre.ogg	Autre	Paguera	[ Electronic ]	2026-09-27 18:53:42.173765+00
83	e35a96d3-ef0b-4b33-8cf5-88733eea4765	78.113.235.105	folder-[ Electronic ]-5-foireAuxVins.ogg	foireAuxVins	Paguera	[ Electronic ]	2026-09-27 18:53:59.243347+00
84	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-1-Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets.ogg	Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets	Paguera	[ Acid ]	2026-09-28 03:16:55.553967+00
85	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-2-Now is Tumorrow.ogg	Now is Tumorrow	Paguera	[ Psy - Goa - Full On]	2026-09-28 03:19:13.482485+00
86	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-3-fair tell no blabla.ogg	fair tell no blabla	Paguera	[ Psy - Goa - Full On]	2026-09-28 03:23:39.25239+00
87	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Psy - Goa - Full On]-0-100 PAS.ogg	100 PAS	Paguera	[ Psy - Goa - Full On]	2026-09-28 03:23:40.45527+00
88	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ OST ]-1-mad soul.ogg	mad soul	Paguera	[ OST ]	2026-09-28 03:27:00.945718+00
89	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Hitech ]-0-My Zombie Track.ogg	My Zombie Track	Paguera	[ Hitech ]	2026-09-28 03:27:44.307082+00
90	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Electronic ]-5-foireAuxVins.ogg	foireAuxVins	Paguera	[ Electronic ]	2026-09-28 03:31:56.117579+00
91	95f04031-7eab-4e09-9ce4-94da5f869e2f	94.231.43.157	folder-[ Acid ]-0-Meloptique.ogg	Meloptique	Paguera	[ Acid ]	2026-09-28 08:37:10.593261+00
92	95f04031-7eab-4e09-9ce4-94da5f869e2f	94.231.43.157	folder-[ Acid ]-1-Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets.ogg	Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets	Paguera	[ Acid ]	2026-09-28 08:58:11.545547+00
93	95f04031-7eab-4e09-9ce4-94da5f869e2f	94.231.43.157	folder-[ Acid ]-2-pin pon.ogg	pin pon	Paguera	[ Acid ]	2026-09-28 08:58:13.3817+00
94	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Acid ]-1-Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets.ogg	Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets	Paguera	[ Acid ]	2026-09-28 12:54:59.953803+00
95	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Acid ]-2-pin pon.ogg	pin pon	Paguera	[ Acid ]	2026-09-28 12:59:29.947263+00
96	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Core ]-0-OKLM.ogg	OKLM	Paguera	[ Core ]	2026-09-28 13:04:52.024772+00
97	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Core ]-1-Serious Damage.ogg	Serious Damage	Paguera	[ Core ]	2026-09-28 13:11:30.876376+00
98	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Core ]-2-chacha plugin.ogg	chacha plugin	Paguera	[ Core ]	2026-09-28 13:16:51.728463+00
99	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Electronic ]-0-Autre.ogg	Autre	Paguera	[ Electronic ]	2026-09-28 13:22:18.030291+00
100	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Electronic ]-2-I Love Crying.ogg	I Love Crying	Paguera	[ Electronic ]	2026-09-28 13:25:50.317909+00
101	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Electronic ]-3-Last knight.ogg	Last knight	Paguera	[ Electronic ]	2026-09-28 13:30:47.712559+00
102	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Electronic ]-4-Proprement dégoûtant.ogg	Proprement dégoûtant	Paguera	[ Electronic ]	2026-09-28 13:34:12.9418+00
103	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Electronic ]-5-foireAuxVins.ogg	foireAuxVins	Paguera	[ Electronic ]	2026-09-28 13:39:06.048566+00
104	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Hip-Hop ]-0-Résillience.ogg	Résillience	Paguera	[ Hip-Hop ]	2026-09-28 14:03:00.104159+00
105	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Hip-Hop ]-2-braco.ogg	braco	Paguera	[ Hip-Hop ]	2026-09-28 14:03:08.558582+00
106	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Hitech ]-0-My Zombie Track.ogg	My Zombie Track	Paguera	[ Hitech ]	2026-09-28 14:03:09.127942+00
107	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ OST ]-1-mad soul.ogg	mad soul	Paguera	[ OST ]	2026-09-28 14:03:11.30367+00
108	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Psy - Goa - Full On]-0-100 PAS.ogg	100 PAS	Paguera	[ Psy - Goa - Full On]	2026-09-28 14:03:12.164129+00
109	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Psy - Goa - Full On]-2-Now is Tumorrow.ogg	Now is Tumorrow	Paguera	[ Psy - Goa - Full On]	2026-09-28 14:03:13.670226+00
110	736b6609-12be-444a-affd-59c257027bcd	94.231.43.157	folder-[ Psy - Goa - Full On]-1-Hero.ogg	Hero	Paguera	[ Psy - Goa - Full On]	2026-09-28 14:04:18.084733+00
111	e35a96d3-ef0b-4b33-8cf5-88733eea4765	2a02:8440:560e:544b::e55:2c3e	folder-[ Electronic ]-5-foireAuxVins.ogg	foireAuxVins	Paguera	[ Electronic ]	2026-09-28 14:55:22.230228+00
112	db108efc-0740-45ef-a44b-36fea8794d83	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c	folder-[ Acid ]-2-pin pon.ogg	pin pon	Paguera	[ Acid ]	2026-09-28 20:17:02.089722+00
113	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Acid ]-1-Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets.ogg	Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets	Paguera	[ Acid ]	2026-09-28 20:53:48.599364+00
114	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Acid ]-2-pin pon.ogg	pin pon	Paguera	[ Acid ]	2026-09-28 20:57:56.524589+00
115	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Core ]-0-OKLM.ogg	OKLM	Paguera	[ Core ]	2026-09-28 21:03:23.135112+00
116	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Core ]-1-Serious Damage.ogg	Serious Damage	Paguera	[ Core ]	2026-09-28 21:06:29.426931+00
117	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Core ]-2-chacha plugin.ogg	chacha plugin	Paguera	[ Core ]	2026-09-28 21:07:35.455812+00
118	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Electronic ]-0-Autre.ogg	Autre	Paguera	[ Electronic ]	2026-09-28 21:10:27.11182+00
119	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Electronic ]-1-C'mon to the crispy mountain Charlie.ogg	C'mon to the crispy mountain Charlie	Paguera	[ Electronic ]	2026-09-28 21:12:33.86712+00
120	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Electronic ]-2-I Love Crying.ogg	I Love Crying	Paguera	[ Electronic ]	2026-09-28 21:13:13.63275+00
121	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Electronic ]-3-Last knight.ogg	Last knight	Paguera	[ Electronic ]	2026-09-28 21:16:19.515488+00
122	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Electronic ]-4-Proprement dégoûtant.ogg	Proprement dégoûtant	Paguera	[ Electronic ]	2026-09-28 21:16:33.238288+00
123	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Electronic ]-5-foireAuxVins.ogg	foireAuxVins	Paguera	[ Electronic ]	2026-09-28 21:16:40.428137+00
124	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Hip-Hop ]-0-Résillience.ogg	Résillience	Paguera	[ Hip-Hop ]	2026-09-28 21:22:10.251795+00
125	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Hip-Hop ]-1-VDM.ogg	VDM	Paguera	[ Hip-Hop ]	2026-09-28 21:22:10.273588+00
126	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Hip-Hop ]-0-Résillience.ogg	Résillience	Paguera	[ Hip-Hop ]	2026-09-28 21:22:13.269039+00
127	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Hip-Hop ]-1-VDM.ogg	VDM	Paguera	[ Hip-Hop ]	2026-09-28 21:25:07.702669+00
128	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Hip-Hop ]-2-braco.ogg	braco	Paguera	[ Hip-Hop ]	2026-09-28 21:27:47.371575+00
129	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Hitech ]-0-My Zombie Track.ogg	My Zombie Track	Paguera	[ Hitech ]	2026-09-28 21:33:27.428164+00
130	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Hitech ]-1-Om.ogg	Om	Paguera	[ Hitech ]	2026-09-28 21:41:55.121885+00
131	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Hitech ]-2-Tadaaaa.ogg	Tadaaaa	Paguera	[ Hitech ]	2026-09-28 21:48:17.891615+00
132	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ OST ]-0-Photosplasmique.ogg	Photosplasmique	Paguera	[ OST ]	2026-09-28 21:52:02.767137+00
133	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ OST ]-1-mad soul.ogg	mad soul	Paguera	[ OST ]	2026-09-28 21:57:08.521527+00
134	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Psy - Goa - Full On]-0-100 PAS.ogg	100 PAS	Paguera	[ Psy - Goa - Full On]	2026-09-28 22:01:47.721471+00
135	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Psy - Goa - Full On]-1-Hero.ogg	Hero	Paguera	[ Psy - Goa - Full On]	2026-09-28 22:01:48.795238+00
136	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Psy - Goa - Full On]-2-Now is Tumorrow.ogg	Now is Tumorrow	Paguera	[ Psy - Goa - Full On]	2026-09-28 22:06:05.856032+00
137	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Psy - Goa - Full On]-3-fair tell no blabla.ogg	fair tell no blabla	Paguera	[ Psy - Goa - Full On]	2026-09-28 22:10:26.609917+00
138	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Reggea ]-0-AloneTogether.ogg	AloneTogether	Paguera	[ Reggea ]	2026-09-28 22:13:01.893658+00
139	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Reggea ]-1-Blob.ogg	Blob	Paguera	[ Reggea ]	2026-09-28 22:13:04.451965+00
140	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Reggea ]-2-Please wake up.ogg	Please wake up	Paguera	[ Reggea ]	2026-09-28 22:13:07.050061+00
141	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Acid ]-0-Meloptique.ogg	Meloptique	Paguera	[ Acid ]	2026-09-28 22:17:33.39534+00
142	e35a96d3-ef0b-4b33-8cf5-88733eea4765	78.113.235.105	folder-[ Acid ]-1-Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets.ogg	Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets	Paguera	[ Acid ]	2026-09-28 23:12:27.098654+00
143	e35a96d3-ef0b-4b33-8cf5-88733eea4765	78.113.235.105	folder-[ Electronic ]-5-foireAuxVins.ogg	foireAuxVins	Paguera	[ Electronic ]	2026-09-28 23:17:17.331783+00
144	e35a96d3-ef0b-4b33-8cf5-88733eea4765	78.113.235.105	folder-[ Psy - Goa - Full On]-2-Now is Tumorrow.ogg	Now is Tumorrow	Paguera	[ Psy - Goa - Full On]	2026-09-28 23:21:54.420724+00
145	e35a96d3-ef0b-4b33-8cf5-88733eea4765	78.113.235.105	root-9-So Are You .ogg	So Are You 	Paguera	Général	2026-09-28 23:26:16.113512+00
146	e35a96d3-ef0b-4b33-8cf5-88733eea4765	2a02:8440:5501:1374::66c2:1a5e	folder-[ Reggea ]-1-Blob.ogg	Blob	Paguera	[ Reggea ]	2026-09-28 23:29:43.07685+00
147	e35a96d3-ef0b-4b33-8cf5-88733eea4765	2a02:8440:5501:1374::66c2:1a5e	folder-[ Acid ]-2-pin pon.ogg	pin pon	Paguera	[ Acid ]	2026-09-28 23:29:46.252577+00
148	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-2-pin pon.ogg	pin pon	Paguera	[ Acid ]	2026-09-29 11:22:02.045401+00
149	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-1-Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets.ogg	Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets	Paguera	[ Acid ]	2026-09-29 11:24:37.589409+00
150	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Acid ]-0-Meloptique.ogg	Meloptique	Paguera	[ Acid ]	2026-09-30 11:20:09.350211+00
151	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Acid ]-1-Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets.ogg	Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets	Paguera	[ Acid ]	2026-09-30 11:26:33.608774+00
152	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Acid ]-2-pin pon.ogg	pin pon	Paguera	[ Acid ]	2026-09-30 11:30:41.491415+00
153	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Core ]-0-OKLM.ogg	OKLM	Paguera	[ Core ]	2026-09-30 11:36:12.02233+00
154	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Core ]-1-Serious Damage.ogg	Serious Damage	Paguera	[ Core ]	2026-09-30 11:42:50.917932+00
155	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Core ]-2-chacha plugin.ogg	chacha plugin	Paguera	[ Core ]	2026-09-30 11:48:11.825548+00
156	667a79f3-9176-463b-bb41-cda2f4eb8f78	78.113.235.105	folder-[ Electronic ]-5-foireAuxVins.ogg	foireAuxVins	Paguera	[ Electronic ]	2026-09-30 11:51:51.933976+00
157	cb272f78-a15f-4038-9ad4-4d6e914b454a	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43	root-8-Inside my phone.ogg	Inside my phone	Paguera	Général	2026-09-30 17:45:53.864967+00
158	cb272f78-a15f-4038-9ad4-4d6e914b454a	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43	folder-[ Psy - Goa - Full On]-1-Hero.ogg	Hero	Paguera	[ Psy - Goa - Full On]	2026-09-30 17:46:06.918277+00
159	cb272f78-a15f-4038-9ad4-4d6e914b454a	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43	folder-[ Acid ]-2-pin pon.ogg	pin pon	Paguera	[ Acid ]	2026-09-30 17:47:01.385985+00
160	736b6609-12be-444a-affd-59c257027bcd	78.113.235.105	folder-[ Acid ]-2-pin pon.ogg	pin pon	Paguera	[ Acid ]	2026-09-30 21:20:39.992765+00
161	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Reggea ]-0-AloneTogether.ogg	AloneTogether	Paguera	[ Reggea ]	2026-10-01 15:01:39.738964+00
162	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Reggea ]-1-Blob.ogg	Blob	Paguera	[ Reggea ]	2026-10-01 15:02:00.100576+00
163	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Reggea ]-2-Please wake up.ogg	Please wake up	Paguera	[ Reggea ]	2026-10-01 15:02:43.624174+00
164	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Psy - Goa - Full On]-0-100 PAS.ogg	100 PAS	Paguera	[ Psy - Goa - Full On]	2026-10-01 15:05:48.237925+00
165	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Psy - Goa - Full On]-1-Hero.ogg	Hero	Paguera	[ Psy - Goa - Full On]	2026-10-01 15:06:07.275827+00
166	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Psy - Goa - Full On]-2-Now is Tumorrow.ogg	Now is Tumorrow	Paguera	[ Psy - Goa - Full On]	2026-10-01 15:06:21.073703+00
167	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Psy - Goa - Full On]-3-fair tell no blabla.ogg	fair tell no blabla	Paguera	[ Psy - Goa - Full On]	2026-10-01 15:06:36.137398+00
168	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ OST ]-0-Photosplasmique.ogg	Photosplasmique	Paguera	[ OST ]	2026-10-01 15:07:43.554024+00
169	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ OST ]-1-mad soul.ogg	mad soul	Paguera	[ OST ]	2026-10-01 15:08:15.682544+00
170	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Hitech ]-0-My Zombie Track.ogg	My Zombie Track	Paguera	[ Hitech ]	2026-10-01 15:08:25.662738+00
171	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Hitech ]-1-Om.ogg	Om	Paguera	[ Hitech ]	2026-10-01 15:08:35.339285+00
172	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Hitech ]-2-Tadaaaa.ogg	Tadaaaa	Paguera	[ Hitech ]	2026-10-01 15:08:45.312039+00
173	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Hip-Hop ]-0-Résillience.ogg	Résillience	Paguera	[ Hip-Hop ]	2026-10-01 15:09:23.498761+00
174	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Hip-Hop ]-1-VDM.ogg	VDM	Paguera	[ Hip-Hop ]	2026-10-01 15:09:28.47738+00
175	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Hip-Hop ]-2-braco.ogg	braco	Paguera	[ Hip-Hop ]	2026-10-01 15:09:34.89816+00
176	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Core ]-0-OKLM.ogg	OKLM	Paguera	[ Core ]	2026-10-01 15:09:45.80146+00
177	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Core ]-1-Serious Damage.ogg	Serious Damage	Paguera	[ Core ]	2026-10-01 15:12:12.232565+00
178	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Core ]-2-chacha plugin.ogg	chacha plugin	Paguera	[ Core ]	2026-10-01 15:12:29.619804+00
179	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Acid ]-0-Meloptique.ogg	Meloptique	Paguera	[ Acid ]	2026-10-01 15:13:34.669316+00
180	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Acid ]-1-Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets.ogg	Toute incapacité à articuler intelligiblement sera sévèrement punie de multiples coups de fouets	Paguera	[ Acid ]	2026-10-01 15:13:51.963286+00
181	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Acid ]-2-pin pon.ogg	pin pon	Paguera	[ Acid ]	2026-10-01 15:14:19.255614+00
182	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Reggea ]-1-Blob.ogg	Blob	Paguera	[ Reggea ]	2026-10-01 15:14:42.187955+00
183	4fde5d14-8ff7-4728-9700-aa70d223af8b	2a04:cec0:1112:ed67:0:64:7655:7301	folder-[ Reggea ]-0-AloneTogether.ogg	AloneTogether	Paguera	[ Reggea ]	2026-10-01 15:16:05.926943+00
\.


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.category (id, name) FROM stdin;
9	GAMES
12	TOOLS
13	DevOps
14	Full-Stack
15	E-Commerce
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.contact_messages (id, name, email, subject, message, is_read, is_archived, ip, created_at) FROM stdin;
2	FORTIER Gabriel	toto@gmail.com	azertuio	Écrivez votre message ici...zertyuiop	t	f	78.113.235.105	2026-09-26 19:35:53.047913+00
1	FORTIER Gabriel	gvfortier@gmail.com	test	TESTTESTESTTESTEST	t	f	78.113.235.105	2026-09-26 19:21:44.08222+00
\.


--
-- Data for Name: page_views; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.page_views (id, visitor_uuid, path, referrer, browser, os, device, created_at, ip) FROM stdin;
1	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 14:57:31.586544+00	\N
2	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 15:00:25.558819+00	\N
3	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 15:00:34.6829+00	\N
4	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/projects	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 15:00:40.15754+00	\N
5	test-gabriel-uuid-123	/projets	https://github.com/paguera	Chrome	Linux	Desktop	2026-09-26 15:00:53.303694+00	\N
6	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 15:01:21.63028+00	\N
7	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 15:01:36.262999+00	\N
8	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 15:04:32.169081+00	\N
9	736b6609-12be-444a-affd-59c257027bcd	/category/devops	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 15:04:50.451435+00	\N
10	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 15:12:46.914663+00	\N
11	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 15:12:56.189314+00	\N
12	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 15:35:14.087636+00	\N
13	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 15:35:20.184131+00	\N
14	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 15:37:55.136745+00	78.113.235.105
15	736b6609-12be-444a-affd-59c257027bcd	/category/devops	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 15:38:45.416385+00	78.113.235.105
16	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 15:38:53.057298+00	78.113.235.105
17	736b6609-12be-444a-affd-59c257027bcd	/category/devops	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 15:44:54.552595+00	78.113.235.105
18	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 15:45:01.638978+00	78.113.235.105
19	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 15:45:03.26047+00	78.113.235.105
20	736b6609-12be-444a-affd-59c257027bcd	/	\N	Chrome	Linux	Desktop	2026-09-26 15:45:07.285229+00	78.113.235.105
21	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 15:46:14.347939+00	78.113.235.105
22	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 15:48:00.691643+00	78.113.235.105
23	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 15:54:19.985946+00	78.113.235.105
24	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 15:54:22.994009+00	78.113.235.105
25	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 15:54:25.760812+00	78.113.235.105
26	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 15:58:58.036423+00	78.113.235.105
27	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/contact	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 15:59:19.660255+00	78.113.235.105
28	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 15:59:53.808225+00	78.113.235.105
29	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/artwork	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 16:00:11.381848+00	78.113.235.105
30	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/projects	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 16:00:31.188948+00	78.113.235.105
31	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/projects	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 16:01:07.078925+00	78.113.235.105
32	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 16:01:08.803511+00	78.113.235.105
33	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/category/devops	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 16:01:13.586846+00	78.113.235.105
34	667a79f3-9176-463b-bb41-cda2f4eb8f78	/	\N	Chrome	Linux	Desktop	2026-09-26 16:21:16.799074+00	78.113.235.105
35	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-26 16:32:25.226165+00	78.113.235.105
36	667a79f3-9176-463b-bb41-cda2f4eb8f78	/	\N	Chrome	Linux	Desktop	2026-09-26 17:01:35.996409+00	78.113.235.105
37	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 18:07:47.901994+00	78.113.235.105
38	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 18:08:03.492626+00	78.113.235.105
39	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 18:09:40.117962+00	78.113.235.105
40	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 18:23:31.771164+00	78.113.235.105
41	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 18:23:38.870438+00	78.113.235.105
42	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 18:25:37.230312+00	78.113.235.105
43	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 18:30:15.672218+00	78.113.235.105
44	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:14:52.065972+00	78.113.235.105
45	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:14:59.673324+00	78.113.235.105
46	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:15:02.181355+00	78.113.235.105
47	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:15:08.130919+00	78.113.235.105
48	736b6609-12be-444a-affd-59c257027bcd	/projects/1	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:15:30.454539+00	78.113.235.105
49	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:15:41.503948+00	78.113.235.105
50	736b6609-12be-444a-affd-59c257027bcd	/projects/9	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:15:45.178868+00	78.113.235.105
51	736b6609-12be-444a-affd-59c257027bcd	/contact	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:15:47.561982+00	78.113.235.105
52	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:15:51.536731+00	78.113.235.105
53	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:15:59.452954+00	78.113.235.105
54	736b6609-12be-444a-affd-59c257027bcd	/category/devops	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:16:10.260921+00	78.113.235.105
55	736b6609-12be-444a-affd-59c257027bcd	/contact	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:16:19.151958+00	78.113.235.105
56	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:39:21.91976+00	78.113.235.105
57	736b6609-12be-444a-affd-59c257027bcd	/category/devops	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:39:33.353702+00	78.113.235.105
58	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:39:37.412705+00	78.113.235.105
59	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 19:41:50.64431+00	78.113.235.105
60	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 20:26:16.387149+00	78.113.235.105
61	736b6609-12be-444a-affd-59c257027bcd	/projects/4	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 20:26:24.67844+00	78.113.235.105
62	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 20:26:42.494348+00	78.113.235.105
63	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 21:23:33.766862+00	78.113.235.105
64	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 21:57:09.990829+00	78.113.235.105
65	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 21:57:48.663823+00	78.113.235.105
66	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-26 22:59:46.794497+00	78.113.235.105
67	9efab847-60b8-4478-8775-b51ead1fd735	/	\N	Chrome	Linux	Desktop	2026-09-27 01:51:37.273309+00	206.206.95.132
68	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-27 05:07:37.912066+00	78.113.235.105
69	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-27 09:59:57.335006+00	78.113.235.105
70	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-27 12:36:32.768401+00	78.113.235.105
71	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-27 12:38:42.11882+00	78.113.235.105
72	fbebfec1-0bea-4911-b0fb-83f58f8e29ab	/projects	\N	Chrome	Android	Mobile	2026-09-27 16:44:20.280916+00	66.249.64.128
73	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-27 18:27:40.731618+00	78.113.235.105
74	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/projects	https://paguera.fr/	Chrome	Android	Mobile	2026-09-27 18:28:09.712994+00	78.113.235.105
75	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/projects/9	https://paguera.fr/	Chrome	Android	Mobile	2026-09-27 18:28:40.011462+00	78.113.235.105
76	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/contact	https://paguera.fr/	Chrome	Android	Mobile	2026-09-27 18:28:53.327299+00	78.113.235.105
77	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/projects/9	https://paguera.fr/	Chrome	Android	Mobile	2026-09-27 18:28:54.843808+00	78.113.235.105
78	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/projects	https://paguera.fr/	Chrome	Android	Mobile	2026-09-27 18:29:21.825363+00	78.113.235.105
79	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-27 18:29:29.133232+00	78.113.235.105
80	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/artwork	https://paguera.fr/	Chrome	Android	Mobile	2026-09-27 18:30:16.963755+00	78.113.235.105
81	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-09-27 18:46:29.964589+00	78.113.235.105
82	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-09-27 18:50:46.849525+00	78.113.235.105
83	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-09-27 19:05:01.367304+00	78.113.235.105
84	48afcd0a-b5cc-427f-bf5b-e33d8a1d7236	/	\N	Chrome	Linux	Desktop	2026-09-28 02:54:41.916239+00	206.206.95.152
85	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 03:13:06.755945+00	78.113.235.105
86	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 03:16:33.238814+00	78.113.235.105
87	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 03:16:52.694794+00	78.113.235.105
88	736b6609-12be-444a-affd-59c257027bcd	/category/devops	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 03:20:40.681492+00	78.113.235.105
89	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 03:26:11.828431+00	78.113.235.105
90	667a79f3-9176-463b-bb41-cda2f4eb8f78	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 04:06:03.36155+00	78.113.235.105
91	667a79f3-9176-463b-bb41-cda2f4eb8f78	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 04:06:50.875219+00	78.113.235.105
92	667a79f3-9176-463b-bb41-cda2f4eb8f78	/	https://portfolio.paguera.fr/music	Chrome	Linux	Desktop	2026-09-28 04:29:28.956281+00	78.113.235.105
93	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 05:37:34.562876+00	78.113.235.105
94	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 05:40:27.560715+00	78.113.235.105
95	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 05:42:17.871185+00	78.113.235.105
96	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 07:06:54.46015+00	94.231.43.157
97	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 07:28:23.383561+00	94.231.43.157
98	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 08:35:26.353291+00	94.231.43.157
99	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 08:35:31.910941+00	94.231.43.157
100	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 08:35:42.726538+00	94.231.43.157
101	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 08:35:42.934792+00	94.231.43.157
102	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 08:35:43.143181+00	94.231.43.157
103	95f04031-7eab-4e09-9ce4-94da5f869e2f	/	https://paguera.fr/	Chrome	macOS	Desktop	2026-09-28 08:36:03.842235+00	94.231.43.157
104	95f04031-7eab-4e09-9ce4-94da5f869e2f	/music	https://paguera.fr/	Chrome	macOS	Desktop	2026-09-28 08:37:08.746511+00	94.231.43.157
105	95f04031-7eab-4e09-9ce4-94da5f869e2f	/	https://paguera.fr/	Chrome	macOS	Desktop	2026-09-28 08:37:12.829908+00	94.231.43.157
106	736b6609-12be-444a-affd-59c257027bcd	/category/devops	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 08:53:11.357298+00	94.231.43.157
107	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 08:53:30.705952+00	94.231.43.157
108	95f04031-7eab-4e09-9ce4-94da5f869e2f	/music	https://paguera.fr/	Chrome	macOS	Desktop	2026-09-28 08:57:57.389702+00	94.231.43.157
109	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 09:00:23.281243+00	94.231.43.157
110	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 09:00:37.497058+00	94.231.43.157
111	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-09-28 09:49:11.891907+00	94.231.43.157
112	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 12:51:25.886998+00	94.231.43.157
113	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 12:53:18.363632+00	94.231.43.157
114	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 12:53:20.446981+00	94.231.43.157
115	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 12:53:22.671817+00	94.231.43.157
116	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 12:53:47.520128+00	94.231.43.157
117	736b6609-12be-444a-affd-59c257027bcd	/category/devops	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 12:53:55.644851+00	94.231.43.157
118	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 12:54:57.691062+00	94.231.43.157
119	5c154a4e-2a35-4ed5-b699-e2044cd5a2b3	/projects	\N	Chrome	Android	Mobile	2026-09-28 13:04:02.792718+00	66.249.64.41
120	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 13:17:53.135436+00	94.231.43.157
121	736b6609-12be-444a-affd-59c257027bcd	/artwork	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 13:17:59.776778+00	94.231.43.157
122	736b6609-12be-444a-affd-59c257027bcd	/artwork	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 13:19:04.131489+00	94.231.43.157
123	736b6609-12be-444a-affd-59c257027bcd	/	\N	Chrome	Linux	Desktop	2026-09-28 13:40:07.241109+00	94.231.43.157
124	736b6609-12be-444a-affd-59c257027bcd	/music	\N	Chrome	Linux	Desktop	2026-09-28 13:40:13.956725+00	94.231.43.157
125	736b6609-12be-444a-affd-59c257027bcd	/artwork	\N	Chrome	Linux	Desktop	2026-09-28 13:40:17.748+00	94.231.43.157
126	736b6609-12be-444a-affd-59c257027bcd	/artwork	\N	Chrome	Linux	Desktop	2026-09-28 13:42:05.541478+00	94.231.43.157
127	736b6609-12be-444a-affd-59c257027bcd	/	\N	Chrome	Linux	Desktop	2026-09-28 13:43:05.57964+00	94.231.43.157
128	736b6609-12be-444a-affd-59c257027bcd	/projects	https://portfolio.paguera.fr/music	Chrome	Linux	Desktop	2026-09-28 13:58:33.866264+00	94.231.43.157
129	736b6609-12be-444a-affd-59c257027bcd	/category/devops	https://portfolio.paguera.fr/music	Chrome	Linux	Desktop	2026-09-28 13:58:35.324787+00	94.231.43.157
130	736b6609-12be-444a-affd-59c257027bcd	/projects	https://portfolio.paguera.fr/music	Chrome	Linux	Desktop	2026-09-28 13:59:20.722005+00	94.231.43.157
131	736b6609-12be-444a-affd-59c257027bcd	/projects/9	https://portfolio.paguera.fr/music	Chrome	Linux	Desktop	2026-09-28 13:59:40.654172+00	94.231.43.157
132	736b6609-12be-444a-affd-59c257027bcd	/projects	https://portfolio.paguera.fr/music	Chrome	Linux	Desktop	2026-09-28 14:00:10.752543+00	94.231.43.157
133	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 14:14:21.56899+00	94.231.43.157
134	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 14:14:24.135809+00	94.231.43.157
135	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-28 14:55:11.933783+00	2a02:8440:560e:544b::e55:2c3e
136	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-09-28 14:55:16.848586+00	2a02:8440:560e:544b::e55:2c3e
137	667a79f3-9176-463b-bb41-cda2f4eb8f78	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 16:41:26.843232+00	78.113.235.105
138	667a79f3-9176-463b-bb41-cda2f4eb8f78	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 16:44:36.207571+00	78.113.235.105
139	667a79f3-9176-463b-bb41-cda2f4eb8f78	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 16:44:43.448516+00	78.113.235.105
140	667a79f3-9176-463b-bb41-cda2f4eb8f78	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 16:55:28.735461+00	78.113.235.105
141	667a79f3-9176-463b-bb41-cda2f4eb8f78	/artwork	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 16:56:46.739424+00	78.113.235.105
142	667a79f3-9176-463b-bb41-cda2f4eb8f78	/category/devops	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 16:59:08.773172+00	78.113.235.105
143	db108efc-0740-45ef-a44b-36fea8794d83	/	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:08:53.518344+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
144	db108efc-0740-45ef-a44b-36fea8794d83	/projects	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:10:53.836498+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
145	db108efc-0740-45ef-a44b-36fea8794d83	/projects/9	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:11:27.921917+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
146	db108efc-0740-45ef-a44b-36fea8794d83	/contact	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:11:35.579782+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
147	db108efc-0740-45ef-a44b-36fea8794d83	/projects/9	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:11:38.596254+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
148	db108efc-0740-45ef-a44b-36fea8794d83	/projects	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:11:52.178814+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
149	db108efc-0740-45ef-a44b-36fea8794d83	/projects/4	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:12:00.620037+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
150	db108efc-0740-45ef-a44b-36fea8794d83	/category/e-commerce	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:14:02.229709+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
151	db108efc-0740-45ef-a44b-36fea8794d83	/category/devops	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:14:16.862067+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
152	db108efc-0740-45ef-a44b-36fea8794d83	/category/e-commerce	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:14:20.544944+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
153	db108efc-0740-45ef-a44b-36fea8794d83	/projects/4	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:14:21.019862+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
154	db108efc-0740-45ef-a44b-36fea8794d83	/projects	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:14:21.88645+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
155	db108efc-0740-45ef-a44b-36fea8794d83	/projects/9	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:14:28.277785+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
156	db108efc-0740-45ef-a44b-36fea8794d83	/projects	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:14:29.294566+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
157	db108efc-0740-45ef-a44b-36fea8794d83	/	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:14:30.461012+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
158	db108efc-0740-45ef-a44b-36fea8794d83	/category/devops	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:14:33.344289+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
159	db108efc-0740-45ef-a44b-36fea8794d83	/artwork	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:16:09.438644+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
160	db108efc-0740-45ef-a44b-36fea8794d83	/music	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:16:46.037757+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
161	db108efc-0740-45ef-a44b-36fea8794d83	/artwork	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:17:13.276826+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
162	db108efc-0740-45ef-a44b-36fea8794d83	/category/devops	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:17:14.134857+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
163	db108efc-0740-45ef-a44b-36fea8794d83	/	https://paguera.fr/	Firefox	Windows	Desktop	2026-09-28 20:17:14.668076+00	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
164	667a79f3-9176-463b-bb41-cda2f4eb8f78	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 20:28:30.78536+00	78.113.235.105
165	667a79f3-9176-463b-bb41-cda2f4eb8f78	/category/devops	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 20:28:47.876085+00	78.113.235.105
166	667a79f3-9176-463b-bb41-cda2f4eb8f78	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 20:28:57.758718+00	78.113.235.105
167	667a79f3-9176-463b-bb41-cda2f4eb8f78	/projects/9	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 20:29:06.058483+00	78.113.235.105
168	667a79f3-9176-463b-bb41-cda2f4eb8f78	/contact	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 20:29:27.190659+00	78.113.235.105
169	667a79f3-9176-463b-bb41-cda2f4eb8f78	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 20:29:33.765101+00	78.113.235.105
170	667a79f3-9176-463b-bb41-cda2f4eb8f78	/category/devops	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 20:29:35.20647+00	78.113.235.105
171	667a79f3-9176-463b-bb41-cda2f4eb8f78	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 20:29:36.81519+00	78.113.235.105
172	667a79f3-9176-463b-bb41-cda2f4eb8f78	/projects/9	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 20:52:41.358716+00	78.113.235.105
173	667a79f3-9176-463b-bb41-cda2f4eb8f78	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-28 20:53:40.388375+00	78.113.235.105
174	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-28 23:12:13.391075+00	78.113.235.105
175	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-09-28 23:12:20.740816+00	78.113.235.105
176	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-29 11:21:13.895064+00	78.113.235.105
177	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-29 11:21:41.558197+00	78.113.235.105
178	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-29 12:54:18.738193+00	78.113.235.105
179	cb272f78-a15f-4038-9ad4-4d6e914b454a	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-29 16:41:15.225856+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
180	cb272f78-a15f-4038-9ad4-4d6e914b454a	/category/devops	https://paguera.fr/	Chrome	Android	Mobile	2026-09-29 16:42:18.130729+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
181	cb272f78-a15f-4038-9ad4-4d6e914b454a	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-29 16:42:24.171756+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
182	504ed350-699c-4745-a746-b83dad5f2bf3	/	\N	Chrome	Linux	Desktop	2026-09-30 03:00:45.746827+00	173.239.198.188
183	5b676c06-b70d-4300-b8cd-b11134ddc286	/	\N	Chrome	Linux	Desktop	2026-09-30 04:16:53.934509+00	191.96.106.213
184	667a79f3-9176-463b-bb41-cda2f4eb8f78	/	\N	Chrome	Linux	Desktop	2026-09-30 10:19:58.524468+00	78.113.235.105
185	e35a96d3-ef0b-4b33-8cf5-88733eea4765	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 10:49:33.519209+00	78.113.235.105
186	667a79f3-9176-463b-bb41-cda2f4eb8f78	/	\N	Chrome	Linux	Desktop	2026-09-30 10:49:43.652101+00	78.113.235.105
187	667a79f3-9176-463b-bb41-cda2f4eb8f78	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-30 11:19:58.294694+00	78.113.235.105
188	667a79f3-9176-463b-bb41-cda2f4eb8f78	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-30 14:45:51.407755+00	78.113.235.105
189	cb272f78-a15f-4038-9ad4-4d6e914b454a	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 17:45:13.474147+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
190	cb272f78-a15f-4038-9ad4-4d6e914b454a	/projects	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 17:45:26.048428+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
191	cb272f78-a15f-4038-9ad4-4d6e914b454a	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 17:45:42.039437+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
192	cb272f78-a15f-4038-9ad4-4d6e914b454a	/projects	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 17:47:10.475715+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
193	cb272f78-a15f-4038-9ad4-4d6e914b454a	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 17:47:11.126026+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
194	cb272f78-a15f-4038-9ad4-4d6e914b454a	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 17:47:18.275422+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
195	cb272f78-a15f-4038-9ad4-4d6e914b454a	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 17:47:22.733786+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
196	cb272f78-a15f-4038-9ad4-4d6e914b454a	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 19:40:18.092189+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
197	cb272f78-a15f-4038-9ad4-4d6e914b454a	/artwork	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 19:40:37.682755+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
198	cb272f78-a15f-4038-9ad4-4d6e914b454a	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 19:40:57.598109+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
199	cb272f78-a15f-4038-9ad4-4d6e914b454a	/artwork	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 19:41:35.729292+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
200	cb272f78-a15f-4038-9ad4-4d6e914b454a	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 19:41:36.570835+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
201	7fc593cc-c738-4cf3-8139-3674977e1d29	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 19:56:41.934176+00	2a01:e0a:b2e:da90:51d:8157:3a67:6666
202	7fc593cc-c738-4cf3-8139-3674977e1d29	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 20:19:05.88872+00	2a01:e0a:b2e:da90:51d:8157:3a67:6666
203	667a79f3-9176-463b-bb41-cda2f4eb8f78	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-30 20:29:25.22718+00	78.113.235.105
204	667a79f3-9176-463b-bb41-cda2f4eb8f78	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-30 20:29:31.643548+00	78.113.235.105
205	667a79f3-9176-463b-bb41-cda2f4eb8f78	/category/devops	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-30 20:29:36.568432+00	78.113.235.105
206	667a79f3-9176-463b-bb41-cda2f4eb8f78	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-30 20:29:39.576378+00	78.113.235.105
207	667a79f3-9176-463b-bb41-cda2f4eb8f78	/artwork	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-30 20:29:41.067987+00	78.113.235.105
208	667a79f3-9176-463b-bb41-cda2f4eb8f78	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-30 20:29:58.134104+00	78.113.235.105
209	667a79f3-9176-463b-bb41-cda2f4eb8f78	/artwork	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-30 20:30:04.875078+00	78.113.235.105
210	4fde5d14-8ff7-4728-9700-aa70d223af8b	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 20:40:32.879588+00	2a04:cec0:111a:b994:0:53:4b3f:d401
211	4fde5d14-8ff7-4728-9700-aa70d223af8b	/projects	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 20:41:11.452482+00	2a04:cec0:111a:b994:0:53:4b3f:d401
212	4fde5d14-8ff7-4728-9700-aa70d223af8b	/category/devops	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 20:43:23.86171+00	2a04:cec0:111a:b994:0:53:4b3f:d401
213	7fc593cc-c738-4cf3-8139-3674977e1d29	/	https://paguera.fr/	Chrome	Android	Mobile	2026-09-30 21:03:09.366626+00	2a01:e0a:b2e:da90:51d:8157:3a67:6666
214	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-30 21:20:04.931841+00	78.113.235.105
215	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-30 21:20:22.097599+00	78.113.235.105
216	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-30 21:20:29.114029+00	78.113.235.105
217	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-30 21:20:38.505097+00	78.113.235.105
218	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-30 21:20:42.738079+00	78.113.235.105
219	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-09-30 21:20:52.387515+00	78.113.235.105
252	58c325b9-7e98-4bfe-88c8-79d684fbf6bf	/	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 07:15:40.328061+00	37.167.78.212
253	58c325b9-7e98-4bfe-88c8-79d684fbf6bf	/projects	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 07:15:50.07706+00	37.167.78.212
254	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-10-01 07:19:11.323326+00	94.231.43.157
255	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-10-01 07:27:59.208993+00	94.231.43.157
256	cb272f78-a15f-4038-9ad4-4d6e914b454a	/	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 07:40:09.632317+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
257	cb272f78-a15f-4038-9ad4-4d6e914b454a	/category/devops	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 07:40:24.698286+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
258	cb272f78-a15f-4038-9ad4-4d6e914b454a	/	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 07:40:29.331644+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
259	cb272f78-a15f-4038-9ad4-4d6e914b454a	/category/devops	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 07:40:34.980926+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
260	cb272f78-a15f-4038-9ad4-4d6e914b454a	/	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 07:40:36.54787+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
261	cb272f78-a15f-4038-9ad4-4d6e914b454a	/projects	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 07:40:47.155251+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
262	cb272f78-a15f-4038-9ad4-4d6e914b454a	/projects/4	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 07:41:06.887678+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
263	cb272f78-a15f-4038-9ad4-4d6e914b454a	/contact	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 07:41:16.31188+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
264	cb272f78-a15f-4038-9ad4-4d6e914b454a	/projects/4	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 07:41:17.453342+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
265	cb272f78-a15f-4038-9ad4-4d6e914b454a	/projects	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 07:41:18.728255+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
266	cb272f78-a15f-4038-9ad4-4d6e914b454a	/	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 07:42:13.541931+00	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
267	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-10-01 08:44:53.044055+00	94.231.43.157
268	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-10-01 08:45:03.501854+00	94.231.43.157
269	736b6609-12be-444a-affd-59c257027bcd	/projects	\N	Chrome	Linux	Desktop	2026-10-01 08:51:37.104098+00	94.231.43.157
270	58c325b9-7e98-4bfe-88c8-79d684fbf6bf	/projects	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 09:11:28.266958+00	2a01:e0a:1287:4660:bcf8:87d1:db89:a171
271	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-10-01 10:31:40.640051+00	94.231.43.157
272	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-10-01 10:32:01.847422+00	94.231.43.157
273	736b6609-12be-444a-affd-59c257027bcd	/projects/1	https://paguera.fr/	Chrome	Linux	Desktop	2026-10-01 10:32:10.196772+00	94.231.43.157
274	736b6609-12be-444a-affd-59c257027bcd	/projects	https://paguera.fr/	Chrome	Linux	Desktop	2026-10-01 10:32:15.596412+00	94.231.43.157
275	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-10-01 10:32:24.48756+00	94.231.43.157
276	736b6609-12be-444a-affd-59c257027bcd	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-10-01 10:39:12.07172+00	94.231.43.157
277	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-10-01 10:42:39.684543+00	94.231.43.157
278	736b6609-12be-444a-affd-59c257027bcd	/music	https://paguera.fr/	Chrome	Linux	Desktop	2026-10-01 11:31:48.593117+00	94.231.43.157
279	4fde5d14-8ff7-4728-9700-aa70d223af8b	/	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 15:00:25.74254+00	2a04:cec0:1112:ed67:0:64:7655:7301
280	4fde5d14-8ff7-4728-9700-aa70d223af8b	/projects	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 15:00:36.458813+00	2a04:cec0:1112:ed67:0:64:7655:7301
281	4fde5d14-8ff7-4728-9700-aa70d223af8b	/	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 15:00:42.475246+00	2a04:cec0:1112:ed67:0:64:7655:7301
282	4fde5d14-8ff7-4728-9700-aa70d223af8b	/	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 15:00:46.474633+00	2a04:cec0:1112:ed67:0:64:7655:7301
283	4fde5d14-8ff7-4728-9700-aa70d223af8b	/category/devops	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 15:00:51.874311+00	2a04:cec0:1112:ed67:0:64:7655:7301
284	4fde5d14-8ff7-4728-9700-aa70d223af8b	/	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 15:00:55.316009+00	2a04:cec0:1112:ed67:0:64:7655:7301
285	4fde5d14-8ff7-4728-9700-aa70d223af8b	/artwork	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 15:01:01.657474+00	2a04:cec0:1112:ed67:0:64:7655:7301
286	4fde5d14-8ff7-4728-9700-aa70d223af8b	/music	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 15:01:18.856472+00	2a04:cec0:1112:ed67:0:64:7655:7301
287	4fde5d14-8ff7-4728-9700-aa70d223af8b	/category/devops	https://paguera.fr/	Chrome	Android	Mobile	2026-10-01 16:11:31.181752+00	2a04:cec0:1112:ed67:0:64:7655:7301
288	a35ef8d1-e9d9-417a-9355-da38e853919a	/	\N	Chrome	Android	Mobile	2026-10-01 16:11:33.165268+00	66.249.93.14
289	c2e6006a-94b5-4e8d-905e-1462b9062ed5	/	http://paguera.fr/	Chrome	Linux	Desktop	2026-10-01 21:48:00.427517+00	51.158.249.6
290	fc6276df-1a8a-4860-8879-d1574b70b540	/	http://paguera.fr/	Chrome	Linux	Desktop	2026-10-01 21:48:01.219164+00	51.158.249.6
291	5d036f89-9dff-4d78-8353-b84a5a3630e0	/	https://paguera.fr/	Chrome	Linux	Desktop	2026-10-01 21:48:15.826965+00	51.158.249.6
\.


--
-- Data for Name: project_links; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.project_links (id, project_id, label, url) FROM stdin;
36	10	Schéma d'Architecture	/architecture-portfolio.svg
37	10	Configuration Docker Compose	https://github.com/paguera/portfolio/blob/main/docker-compose.yml
38	10	Documentation & Setup	https://github.com/paguera/portfolio/blob/main/README.md
39	4	Interface admin	https://geaidubol-admin.paguera.fr/
40	4	Mail Hog	https://mailhog.paguera.fr
\.


--
-- Data for Name: project_technologies; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.project_technologies (project_id, technology_id) FROM stdin;
10	3
10	5
10	16
10	17
10	18
10	19
10	20
10	23
8	3
8	4
8	5
8	6
4	1
4	3
4	8
4	9
4	10
2	3
2	4
1	1
1	2
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.projects (id, title, description, category_id, demo_url, image_url, created_at, updated_at, is_published, is_featured, content_markdown, slug, display_order) FROM stdin;
8	Mars/ai	Cas d'école : un festival de features	14	https://marsai.paguera.fr	https://marsai.paguera.fr/Scifi-Room.avif	2026-09-03 16:22:45.775622+00	2026-09-24 11:33:56.99124+00	t	f		\N	0
2	Mémo	Retrouvez les 6 paires de cartes !	9	https://memo.paguera.fr	https://memo.paguera.fr/penguin.svg	2026-07-03 13:58:01.44249+00	2026-08-06 14:41:57.821459+00	t	f		\N	0
1	Tic-Tac-Toe	Affrontez votre adversaire dans une lutte sans fin !\n	9	https://tic-tac-toe.paguera.fr	https://tic-tac-toe.paguera.fr/img.jpg	2026-07-03 13:54:39.065696+00	2026-08-06 14:42:03.750793+00	t	f		\N	0
4	Geai Du Bol	Site de E-commerce pour micro-entreprise de creation / vente en ligne de poteries et céramiques. En cours de développement.	15	https://geaidubol.paguera.fr/	https://geaidubol-admin.paguera.fr/media/image/ce/98/54eb45040c3c7949dab2277f5fbc.jpg	2026-07-03 14:08:53.031393+00	2026-09-24 11:34:27.769277+00	t	f		\N	0
9	Merise Forge	La modélisation de base de données via la méthode Merise n'a jamais été aussi intuitive!	12	https://merise-forge.paguera.fr	https://merise-forge.paguera.fr/FORGE.jpeg	2026-09-18 11:17:08.513332+00	2026-09-20 07:13:43.845045+00	t	f		\N	0
10	Architecture & Déploiement Portfolio (Docker Compose)	Architecture multi-conteneurs conteneurisée pour le déploiement en production : Reverse Proxy Nginx, API REST Express 5 TypeScript, Base de données PostgreSQL 15 avec persistance des volumes et séparation stricte des environnements Frontend Visiteurs / Admin.	13	\N	/architecture-portfolio.svg	2026-09-24 08:59:54.01307+00	2026-09-24 08:59:54.01307+00	t	f		\N	0
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.site_settings (key, value, updated_at) FROM stdin;
availability_status	Disponible pour de nouvelles opportunités	2026-10-01 10:31:19.820075+00
is_available	true	2026-10-01 10:31:19.820075+00
hero_title_accent	Développeur Full-Stack & candidat CDA	2026-10-01 10:31:19.820075+00
hero_bio	Passionné par la conception d'applications web robustes, l'architecture logicielle et l'automatisation des déploiements. Je construis des solutions complètes de la base de données jusqu'à l'infrastructure.	2026-10-01 10:31:19.820075+00
\.


--
-- Data for Name: technologies; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.technologies (id, name, icon_class) FROM stdin;
1	PHP	\N
2	$_SESSION	\N
3	TypeScript	\N
4	react	\N
5	Express	\N
6	mariadb	\N
7	Maria DB	\N
8	symfony	\N
9	next	\N
10	postgreSQL	\N
11	Web audio API	\N
12	Canvas	\N
13	Ableton Live	\N
14	Hardware synths	\N
15	Max 4 Live	\N
16	Docker	devicon-docker-plain
17	Docker Compose	devicon-docker-plain
18	Nginx	devicon-nginx-original
19	Linux	devicon-linux-plain
20	PostgreSQL	devicon-postgresql-plain
23	React	devicon-react-original
24	GitHub Actions	devicon-githubactions-plain
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.users (id, email, password, role, created_at) FROM stdin;
1	admin@portfolio.paguera.fr	$2b$10$CdivQtRwBc6rYf3hNMwZp.8U63L.uxea9MJ/CF7R854cLVfcZO92.	admin	2026-07-03 13:05:36.918497+00
2	gab.vf.93@gmail.com	$2b$10$1Y5aFEgB/4lXn.A/XuJsuuuRxVhzFrOWPwQgAdg7aa9aLO27yqZ4G	admin	2026-07-23 09:39:09.675939+00
\.


--
-- Data for Name: visitors; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.visitors (id, visitor_uuid, created_at, last_visit_at, total_visits, ip) FROM stdin;
384	692332df-885a-4355-9c3d-8e06e920d01d	2026-08-23 17:56:44.218899+00	2026-08-23 18:12:35.636276+00	1	\N
297	600a7701-0f3c-4a97-8690-4e2646780b5d	2026-08-18 12:49:02.357662+00	2026-08-18 12:49:02.357662+00	1	\N
298	a341de90-2c76-4d2d-b5d8-108d12d26e31	2026-08-18 12:49:36.95077+00	2026-08-18 12:49:36.95077+00	1	\N
299	e45d0b89-ac9f-4c55-bf35-0d7e0d3fec8c	2026-08-18 12:49:37.463878+00	2026-08-18 12:49:37.463878+00	1	\N
250	ebaec4e9-0f0c-4475-9eda-729a964b5cac	2026-08-10 04:45:24.951783+00	2026-08-10 04:45:24.951783+00	1	\N
251	8e2fce72-d401-46c9-b64c-92f291dfd80a	2026-08-10 05:34:14.241619+00	2026-08-10 05:34:14.241619+00	1	\N
252	70f4d324-c4d0-45c8-b752-00304a050ad6	2026-08-10 09:54:40.787136+00	2026-08-10 09:54:40.787136+00	1	\N
253	ad3cd233-76b7-4ece-8c99-2fc1a53ae24c	2026-08-10 12:51:28.532127+00	2026-08-10 12:51:28.532127+00	1	\N
415	f306a60e-d845-408a-890d-14d168d4b4cb	2026-08-28 17:00:42.493321+00	2026-08-29 12:04:28.450039+00	1	\N
79	6243afee-e140-496b-8e45-c1a936745d99	2026-07-25 11:40:40.966977+00	2026-07-25 11:40:40.966977+00	1	\N
80	0d02fd92-1e7e-472b-8e7f-a93012a15445	2026-07-25 11:40:44.574003+00	2026-07-25 11:40:44.574003+00	1	\N
302	59470df9-a158-42c7-8667-02eaef9c7d69	2026-08-19 01:04:17.414908+00	2026-08-19 01:04:17.414908+00	1	\N
442	8ead5686-9163-4025-a6af-72a6a7df631f	2026-08-31 03:39:33.663095+00	2026-08-31 03:39:33.663095+00	1	\N
258	50cba8c0-55d6-4854-967b-44119bd32528	2026-08-12 03:52:48.301332+00	2026-08-12 03:52:48.301332+00	1	\N
259	94033c1e-9e33-43d4-ad6e-29961e3570e5	2026-08-12 05:00:48.259199+00	2026-08-12 05:00:48.259199+00	1	\N
260	9693458d-e0c8-4e65-8cd0-9aad7b8b59d0	2026-08-12 06:14:31.980835+00	2026-08-12 06:14:31.980835+00	1	\N
261	983cf5e3-489e-4018-93c7-c3ea7fdfa557	2026-08-12 07:22:36.901818+00	2026-08-12 07:22:36.901818+00	1	\N
390	6cd04d56-c597-4fc1-acc6-fe9b0896da56	2026-08-24 03:16:45.105+00	2026-08-24 03:16:45.105+00	1	\N
443	fb48cfdb-20a7-496c-ae3c-bcd1b7d4a58e	2026-08-31 03:39:40.241492+00	2026-08-31 03:39:40.241492+00	1	\N
306	dec99b03-d010-4904-b306-bb6abdb1ec81	2026-08-20 00:08:25.148036+00	2026-08-20 00:08:25.148036+00	1	\N
307	8afc6711-77ba-45ad-ad05-70ac65d888ad	2026-08-20 03:23:04.559933+00	2026-08-20 03:23:04.559933+00	1	\N
211	521f8829-2f16-4fae-a7d7-90295073aaba	2026-08-07 11:24:52.129787+00	2026-08-07 11:24:52.129787+00	1	\N
352	876df2aa-9081-4871-9515-1484e1b75b54	2026-08-21 21:22:12.719613+00	2026-08-21 21:22:12.719613+00	1	\N
444	43d4cc5f-2924-4b9c-971d-5f2db4d2e3ed	2026-08-31 03:39:40.38541+00	2026-08-31 03:39:40.38541+00	1	\N
214	6dbaa43b-7066-4815-b561-f0eae9ba3421	2026-08-07 13:26:50.268369+00	2026-08-07 13:26:50.268369+00	1	\N
96	d80f9d33-7877-4858-af35-434bb334be3c	2026-08-04 16:51:42.641895+00	2026-08-04 16:51:42.641895+00	1	\N
97	01d1267b-e7c1-4529-89f2-bf4393fca677	2026-08-04 16:51:43.32601+00	2026-08-04 16:51:43.32601+00	1	\N
267	e6659d22-0249-4c13-9ea1-dd6dbb88ae49	2026-08-12 18:38:33.107299+00	2026-08-29 20:39:21.980765+00	1	\N
87	9f72282c-16c7-4048-8f48-a4bb42c9234e	2026-07-29 12:09:54.680904+00	2026-08-24 11:43:13.123018+00	1	\N
218	592e0566-d89f-44d2-8321-88fc890b5d92	2026-08-07 18:02:55.669417+00	2026-08-07 18:02:55.669417+00	1	\N
309	d70ff80a-b0d3-4674-a9ca-f6bf418ab3a4	2026-08-20 23:08:10.256954+00	2026-08-20 23:08:10.256954+00	1	\N
270	84b061fe-f67e-416f-840d-3ce5c2512fa6	2026-08-12 18:57:17.913996+00	2026-08-12 18:57:17.913996+00	1	\N
49	796e8578-ad66-40c5-acef-6082072990b8	2026-07-23 19:46:31.417135+00	2026-08-31 17:07:45.791851+00	1	\N
427	1b027b82-7f90-48fa-85ca-bffae74c5a14	2026-08-30 15:31:04.229795+00	2026-08-30 15:31:04.229795+00	1	\N
223	898083a9-91b8-464a-b593-c1f7b63fd24d	2026-08-08 08:15:29.166875+00	2026-08-08 08:15:29.166875+00	1	\N
42	0d133140-66b5-49dd-8248-adfb925259b3	2026-07-23 17:08:05.943882+00	2026-07-23 17:08:05.943882+00	1	\N
43	921b8a8b-bd9f-470f-ae0c-fda262db833b	2026-07-23 17:08:45.356799+00	2026-07-23 17:08:45.356799+00	1	\N
44	ef16eed5-3b0b-47de-9b5f-c5aac5fb8910	2026-07-23 17:08:45.769629+00	2026-07-23 17:08:45.769629+00	1	\N
45	986dedb2-799a-4c2f-a3e5-8ec53424d197	2026-07-23 18:47:11.871584+00	2026-07-23 18:47:11.871584+00	1	\N
46	fc3f777d-a14c-4cd4-b31a-4705a43be825	2026-07-23 18:52:28.632431+00	2026-07-23 18:52:28.632431+00	1	\N
47	18dccf7c-159a-4e8c-aa1e-565458df604e	2026-07-23 19:00:56.067189+00	2026-07-23 19:00:56.067189+00	1	\N
48	c94fb52e-031e-4b5f-9c76-7f8c81119bf5	2026-07-23 19:21:50.12208+00	2026-07-23 19:21:50.12208+00	1	\N
224	272cf8e7-a8e2-42df-a8df-0ddfc6bee0f9	2026-08-08 17:27:49.716189+00	2026-08-08 17:27:49.716189+00	1	\N
51	2965a201-c8a1-4110-b31f-3f4d6a38ab47	2026-07-23 22:17:05.776934+00	2026-07-23 22:17:05.776934+00	1	\N
52	0e9c704c-60e1-4dd9-8ad7-55209128047a	2026-07-24 07:35:32.686962+00	2026-07-24 07:35:32.686962+00	1	\N
53	5a242eb9-8762-4c6c-8100-d6f5d9ee4742	2026-07-24 07:41:05.469223+00	2026-07-24 07:41:05.469223+00	1	\N
272	2e4b441a-03b6-415d-954b-e2399e397700	2026-08-12 22:40:10.853913+00	2026-08-12 22:40:10.853913+00	1	\N
273	07e4c6f0-7ebc-4da5-8afe-cb80323a7440	2026-08-14 02:49:01.045217+00	2026-08-14 02:49:01.045217+00	1	\N
111	10980b7f-849e-4101-81c6-3d08b671b679	2026-08-05 11:02:00.975687+00	2026-08-05 11:02:00.975687+00	1	\N
482	54ef0578-aed2-49be-91e8-b5e8dd0ad8f8	2026-09-07 02:00:38.305812+00	2026-09-07 02:00:38.305812+00	1	\N
113	d93d4542-1672-4a30-a555-2a1eabaafeb8	2026-08-05 14:58:21.526818+00	2026-08-05 14:58:21.526818+00	1	\N
402	6ce1e600-dc6d-42ed-bad8-dc08bd66c73d	2026-08-25 07:54:01.944673+00	2026-08-28 11:05:16.004721+00	1	\N
60	b6ab129f-e346-4a58-81e8-8d780daf2f71	2026-07-24 11:32:15.709342+00	2026-07-24 11:32:15.709342+00	1	\N
276	97096ebc-8e42-483f-ac9b-be21537676de	2026-08-14 22:12:02.005168+00	2026-08-14 22:12:02.005168+00	1	\N
115	79e22986-a684-4827-8798-1f266dd7f540	2026-08-06 08:20:11.197938+00	2026-08-06 08:20:11.197938+00	1	\N
414	6eb12c49-221a-4db0-adb8-0db653d9d3e9	2026-08-28 16:41:03.4351+00	2026-08-28 16:41:03.4351+00	1	\N
277	b25a7be1-bb6b-4074-acf2-6174817456a1	2026-08-14 22:12:22.504827+00	2026-08-14 22:16:15.015472+00	1	\N
280	3d0cb902-e827-4239-bb3e-af291e5c63c7	2026-08-15 11:05:22.582393+00	2026-08-15 11:05:22.582393+00	1	\N
428	4fa6ac31-c1dd-40c5-b820-46f9190d4110	2026-08-30 15:31:07.229745+00	2026-08-30 15:31:07.229745+00	1	\N
282	fdc1d033-0f58-478b-8444-be3dfe5bbecb	2026-08-16 03:22:42.86054+00	2026-08-16 03:22:42.86054+00	1	\N
69	97452963-e5ec-468b-8240-d1a86846954e	2026-07-24 21:29:14.667853+00	2026-08-23 17:20:31.312797+00	1	\N
184	4e84459b-36dd-4388-996d-4a937d324a8f	2026-08-06 17:10:09.135209+00	2026-08-22 11:46:05.905138+00	1	\N
286	f410aa43-99b8-41ce-a7b9-df278891a51a	2026-08-17 16:05:02.051347+00	2026-08-17 16:05:02.051347+00	1	\N
364	41287ea8-bfa2-4376-a663-5ff1733994b3	2026-08-22 11:46:41.02173+00	2026-08-22 11:46:41.02173+00	1	\N
421	697265f3-a128-4129-8ab1-f3df1feeef8f	2026-08-29 18:05:15.665107+00	2026-09-04 11:38:26.466877+00	1	\N
289	6c632534-4344-4ef9-adf3-6f72ac0f93e4	2026-08-18 02:55:57.920543+00	2026-08-18 02:55:57.920543+00	1	\N
290	67bc7905-4f91-4f92-8d2a-d76abe89fbeb	2026-08-18 08:14:10.376993+00	2026-08-18 08:14:10.376993+00	1	\N
310	4ae2cea0-1755-4b0e-ab60-49bcd004250d	2026-08-20 23:10:36.289873+00	2026-08-20 23:11:20.855901+00	1	\N
188	ba925300-e74b-4d92-910b-9f0a0ac2cdcb	2026-08-06 17:23:02.389658+00	2026-08-06 17:23:02.389658+00	1	\N
588	7b4102a3-de69-481c-a04c-1f1480a9136a	2026-09-19 03:59:52.886992+00	2026-09-19 03:59:52.886992+00	1	\N
294	9f233336-242e-455d-8293-028924c4ebd6	2026-08-18 09:53:55.30303+00	2026-08-18 09:53:55.30303+00	1	\N
323	41e6c02d-e65a-4996-b16c-3511d641a1c0	2026-08-21 03:46:45.478163+00	2026-08-21 03:46:45.478163+00	1	\N
1	3f98212e-193b-4fef-b481-8e5c6d9c03ba	2026-07-23 08:53:36.431004+00	2026-08-26 13:46:26.383789+00	1	\N
449	f01c8cb2-e40c-4b7a-abf6-701152baf81b	2026-09-03 11:48:35.641182+00	2026-09-03 11:48:35.641182+00	1	\N
458	63f9b6fe-a368-4d6d-ad99-c2a42ecef9ca	2026-09-04 21:07:14.441242+00	2026-09-04 21:29:29.540896+00	1	\N
430	7ac3d0c7-55f0-4cc1-8b85-9cb2bb5a1f9d	2026-08-30 16:02:13.824837+00	2026-08-30 16:34:31.180759+00	1	\N
460	74237a52-25ac-43d5-840c-7e78935415de	2026-09-05 02:53:34.407776+00	2026-09-05 02:53:34.407776+00	1	\N
470	64a72ad9-dcc5-415e-93c5-f83db30f0105	2026-09-06 14:58:40.404548+00	2026-09-08 19:38:09.732958+00	1	\N
493	0417b641-1d8f-4f6f-933c-76153f3b67be	2026-09-14 07:31:19.14574+00	2026-09-14 07:31:19.14574+00	1	\N
462	667a79f3-9176-463b-bb41-cda2f4eb8f78	2026-09-05 23:53:37.288239+00	2026-09-30 20:30:04.851252+00	33	78.113.235.105
486	fd2730a0-dc09-40c9-a7e9-8695efde0ce3	2026-09-10 23:12:31.693435+00	2026-09-10 23:12:31.693435+00	1	\N
487	e1018c97-6cd5-4185-bc7d-89e2ccd3496c	2026-09-11 12:31:00.122603+00	2026-09-11 12:31:00.122603+00	1	\N
488	926decf6-5b92-464b-b4ff-69b3ecc27a87	2026-09-11 12:31:01.264797+00	2026-09-11 12:31:01.264797+00	1	\N
494	cb37059c-2a3d-49aa-9ed3-60bb21ce503e	2026-09-14 13:44:35.422853+00	2026-09-14 13:44:35.422853+00	1	\N
495	3325eb54-2003-4e8c-8ee4-b6640044eeb5	2026-09-14 13:45:03.185193+00	2026-09-14 13:45:03.185193+00	1	\N
496	c2a8ad6e-c514-4111-bbca-5b039ad9f4d4	2026-09-14 13:45:03.332617+00	2026-09-14 13:45:03.332617+00	1	\N
497	5d65669f-72d7-4968-840e-b539fb1902e3	2026-09-14 16:24:37.301055+00	2026-09-14 16:24:37.301055+00	1	\N
500	767208b7-aac3-4fca-b65f-453289e68925	2026-09-15 10:51:11.923771+00	2026-09-15 10:51:11.923771+00	1	\N
691	2920edf9-e2c8-490f-8776-97473da5b8f9	2026-09-26 14:54:25.508921+00	2026-09-26 14:54:25.508921+00	1	\N
692	abeb9866-b2e1-48ba-a9f8-e5fdfc900def	2026-09-26 14:54:35.280372+00	2026-09-26 14:54:35.280372+00	1	\N
693	145625a3-0c74-4d8b-b3a7-6290421be101	2026-09-26 14:54:35.41803+00	2026-09-26 14:54:35.41803+00	1	\N
796	95f04031-7eab-4e09-9ce4-94da5f869e2f	2026-09-28 08:36:03.791443+00	2026-09-28 08:57:57.366629+00	4	94.231.43.157
894	7fc593cc-c738-4cf3-8139-3674977e1d29	2026-09-30 19:56:41.906423+00	2026-09-30 21:03:09.343398+00	3	2a01:e0a:b2e:da90:51d:8157:3a67:6666
485	736b6609-12be-444a-affd-59c257027bcd	2026-09-10 11:08:44.661843+00	2026-10-01 11:31:48.571551+00	111	94.231.43.157
698	test-gabriel-uuid-123	2026-09-26 15:00:53.187917+00	2026-09-26 15:00:53.187917+00	1	\N
836	db108efc-0740-45ef-a44b-36fea8794d83	2026-09-28 20:08:53.476858+00	2026-09-28 20:17:14.660475+00	21	2a01:e0a:b2e:da90:d9a:98d6:3e3d:1f8c
760	9efab847-60b8-4478-8775-b51ead1fd735	2026-09-27 01:51:37.211469+00	2026-09-27 01:51:37.211469+00	1	206.206.95.132
812	5c154a4e-2a35-4ed5-b699-e2044cd5a2b3	2026-09-28 13:04:02.75467+00	2026-09-28 13:04:02.75467+00	1	66.249.64.41
903	4fde5d14-8ff7-4728-9700-aa70d223af8b	2026-09-30 20:40:32.853102+00	2026-10-01 16:11:31.153636+00	12	2a04:cec0:1112:ed67:0:64:7655:7301
765	fbebfec1-0bea-4911-b0fb-83f58f8e29ab	2026-09-27 16:44:20.211693+00	2026-09-27 16:44:20.211693+00	1	66.249.64.128
981	a35ef8d1-e9d9-417a-9355-da38e853919a	2026-10-01 16:11:33.160696+00	2026-10-01 16:11:33.160696+00	1	66.249.93.14
526	11fc996e-961e-4824-84a9-877738644fe0	2026-09-18 09:53:45.353534+00	2026-09-18 09:53:45.353534+00	1	\N
982	c2e6006a-94b5-4e8d-905e-1462b9062ed5	2026-10-01 21:48:00.409211+00	2026-10-01 21:48:00.409211+00	1	51.158.249.6
983	fc6276df-1a8a-4860-8879-d1574b70b540	2026-10-01 21:48:01.215729+00	2026-10-01 21:48:01.215729+00	1	51.158.249.6
875	504ed350-699c-4745-a746-b83dad5f2bf3	2026-09-30 03:00:45.725587+00	2026-09-30 03:00:45.725587+00	1	173.239.198.188
876	5b676c06-b70d-4300-b8cd-b11134ddc286	2026-09-30 04:16:53.906975+00	2026-09-30 04:16:53.906975+00	1	191.96.106.213
398	e35a96d3-ef0b-4b33-8cf5-88733eea4765	2026-08-25 00:48:20.613015+00	2026-09-30 10:49:33.495389+00	38	78.113.235.105
984	5d036f89-9dff-4d78-8353-b84a5a3630e0	2026-10-01 21:48:15.806095+00	2026-10-01 21:48:15.806095+00	1	51.158.249.6
777	48afcd0a-b5cc-427f-bf5b-e33d8a1d7236	2026-09-28 02:54:41.898747+00	2026-09-28 02:54:41.898747+00	1	206.206.95.152
61	cb272f78-a15f-4038-9ad4-4d6e914b454a	2026-07-24 11:52:53.012399+00	2026-10-01 07:42:13.504951+00	27	2a01:e0a:b2e:da90:c921:e788:a6d4:3f43
945	58c325b9-7e98-4bfe-88c8-79d684fbf6bf	2026-10-01 07:15:40.169294+00	2026-10-01 09:11:28.253216+00	3	2a01:e0a:1287:4660:bcf8:87d1:db89:a171
626	db5cd423-d809-4a01-a316-8cbe89af10fd	2026-09-20 18:24:50.166031+00	2026-09-20 18:24:50.166031+00	1	\N
627	d085664d-79af-4b9f-8738-532422df1d4b	2026-09-21 03:21:37.746396+00	2026-09-21 03:21:37.746396+00	1	\N
629	7988befb-9874-449f-92fa-95fc14d52d3d	2026-09-21 18:42:04.726442+00	2026-09-21 18:42:04.726442+00	1	\N
638	64647386-7776-49bb-a08f-d314c5305265	2026-09-22 01:41:36.882914+00	2026-09-22 01:41:36.882914+00	1	\N
643	597f6c9e-06ed-4d6c-a24e-93b4b5f43b6e	2026-09-24 01:49:05.235104+00	2026-09-24 01:49:05.235104+00	1	\N
644	323e92e0-bc6b-4aa1-81cc-49f643bfa3bb	2026-09-24 01:50:51.733647+00	2026-09-24 01:50:51.733647+00	1	\N
664	6fce2dc4-5007-44be-9bd7-9475a6305b46	2026-09-25 03:48:07.867499+00	2026-09-25 03:48:07.867499+00	1	\N
677	e0b62f79-8b14-48b0-947c-dfbda537a36c	2026-09-26 05:27:24.642587+00	2026-09-26 05:27:24.642587+00	1	\N
\.


--
-- Name: artworks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.artworks_id_seq', 9, true);


--
-- Name: audio_plays_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.audio_plays_id_seq', 183, true);


--
-- Name: category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.category_id_seq', 15, true);


--
-- Name: contact_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.contact_messages_id_seq', 2, true);


--
-- Name: page_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.page_views_id_seq', 291, true);


--
-- Name: project_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.project_links_id_seq', 40, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.projects_id_seq', 10, true);


--
-- Name: technologies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.technologies_id_seq', 24, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: visitors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.visitors_id_seq', 984, true);


--
-- Name: artworks artworks_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.artworks
    ADD CONSTRAINT artworks_pkey PRIMARY KEY (id);


--
-- Name: audio_plays audio_plays_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.audio_plays
    ADD CONSTRAINT audio_plays_pkey PRIMARY KEY (id);


--
-- Name: category category_name_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_name_key UNIQUE (name);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: page_views page_views_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.page_views
    ADD CONSTRAINT page_views_pkey PRIMARY KEY (id);


--
-- Name: project_links project_links_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.project_links
    ADD CONSTRAINT project_links_pkey PRIMARY KEY (id);


--
-- Name: project_technologies project_technologies_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.project_technologies
    ADD CONSTRAINT project_technologies_pkey PRIMARY KEY (project_id, technology_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (key);


--
-- Name: technologies technologies_name_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.technologies
    ADD CONSTRAINT technologies_name_key UNIQUE (name);


--
-- Name: technologies technologies_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.technologies
    ADD CONSTRAINT technologies_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: visitors visitors_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT visitors_pkey PRIMARY KEY (id);


--
-- Name: visitors visitors_visitor_uuid_key; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT visitors_visitor_uuid_key UNIQUE (visitor_uuid);


--
-- Name: idx_artworks_display_order; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_artworks_display_order ON public.artworks USING btree (display_order);


--
-- Name: idx_artworks_published; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_artworks_published ON public.artworks USING btree (is_published);


--
-- Name: idx_audio_plays_created_at; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_audio_plays_created_at ON public.audio_plays USING btree (created_at);


--
-- Name: idx_audio_plays_track_title; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_audio_plays_track_title ON public.audio_plays USING btree (track_title);


--
-- Name: idx_contact_messages_created_at; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_contact_messages_created_at ON public.contact_messages USING btree (created_at);


--
-- Name: idx_contact_messages_is_archived; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_contact_messages_is_archived ON public.contact_messages USING btree (is_archived);


--
-- Name: idx_contact_messages_is_read; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_contact_messages_is_read ON public.contact_messages USING btree (is_read);


--
-- Name: idx_page_views_created_at; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_page_views_created_at ON public.page_views USING btree (created_at);


--
-- Name: idx_page_views_ip; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_page_views_ip ON public.page_views USING btree (ip);


--
-- Name: idx_page_views_path; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_page_views_path ON public.page_views USING btree (path);


--
-- Name: idx_page_views_visitor; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_page_views_visitor ON public.page_views USING btree (visitor_uuid);


--
-- Name: idx_projects_category; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_projects_category ON public.projects USING btree (category_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: projects set_timestamp; Type: TRIGGER; Schema: public; Owner: user
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: project_links project_links_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.project_links
    ADD CONSTRAINT project_links_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_technologies project_technologies_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.project_technologies
    ADD CONSTRAINT project_technologies_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_technologies project_technologies_technology_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.project_technologies
    ADD CONSTRAINT project_technologies_technology_id_fkey FOREIGN KEY (technology_id) REFERENCES public.technologies(id) ON DELETE CASCADE;


--
-- Name: projects projects_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- TABLES DES NOTATIONS ET COMMENTAIRES DU LAB CRÉATIF
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.artwork_ratings (
    id SERIAL PRIMARY KEY,
    artwork_id INTEGER NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    visitor_uuid VARCHAR(255) NOT NULL,
    ip VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_visitor_artwork_rating UNIQUE (artwork_id, visitor_uuid)
);

CREATE INDEX IF NOT EXISTS idx_artwork_ratings_artwork_id ON public.artwork_ratings(artwork_id);

CREATE TABLE IF NOT EXISTS public.artwork_comments (
    id SERIAL PRIMARY KEY,
    artwork_id INTEGER NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL DEFAULT 'Visiteur',
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    visitor_uuid VARCHAR(255) NOT NULL,
    ip VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_artwork_comments_artwork_id ON public.artwork_comments(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_comments_approved ON public.artwork_comments(is_approved);

-- -----------------------------------------------------------------------------
-- TABLES DES NOTATIONS ET COMMENTAIRES DES MUSIQUES (TRACKS)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.track_ratings (
    id SERIAL PRIMARY KEY,
    track_id VARCHAR(255) NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    visitor_uuid VARCHAR(255) NOT NULL,
    ip VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_visitor_track_rating UNIQUE (track_id, visitor_uuid)
);

CREATE INDEX IF NOT EXISTS idx_track_ratings_track_id ON public.track_ratings(track_id);

CREATE TABLE IF NOT EXISTS public.track_comments (
    id SERIAL PRIMARY KEY,
    track_id VARCHAR(255) NOT NULL,
    author_name VARCHAR(100) NOT NULL DEFAULT 'Visiteur',
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    visitor_uuid VARCHAR(255) NOT NULL,
    ip VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_track_comments_track_id ON public.track_comments(track_id);
CREATE INDEX IF NOT EXISTS idx_track_comments_approved ON public.track_comments(is_approved);

--
-- PostgreSQL database dump complete
--



