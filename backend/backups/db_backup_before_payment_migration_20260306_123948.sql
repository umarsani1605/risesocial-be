--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Postgres.app)
-- Dumped by pg_dump version 17.5 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AcademyStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AcademyStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'ARCHIVED'
);


ALTER TYPE public."AcademyStatus" OWNER TO postgres;

--
-- Name: EnrollmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EnrollmentStatus" AS ENUM (
    'ENROLLED',
    'COMPLETED',
    'CANCELLED',
    'SUSPENDED'
);


ALTER TYPE public."EnrollmentStatus" OWNER TO postgres;

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'PREFER_NOT_TO_SAY'
);


ALTER TYPE public."Gender" OWNER TO postgres;

--
-- Name: MidtransFraudStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MidtransFraudStatus" AS ENUM (
    'accept',
    'challenge',
    'deny'
);


ALTER TYPE public."MidtransFraudStatus" OWNER TO postgres;

--
-- Name: MidtransTransactionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MidtransTransactionStatus" AS ENUM (
    'pending',
    'capture',
    'settlement',
    'deny',
    'cancel',
    'expire',
    'refund',
    'chargeback'
);


ALTER TYPE public."MidtransTransactionStatus" OWNER TO postgres;

--
-- Name: ProgramStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProgramStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'DRAFT'
);


ALTER TYPE public."ProgramStatus" OWNER TO postgres;

--
-- Name: RylsDiscoverSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RylsDiscoverSource" AS ENUM (
    'RISE_INSTAGRAM',
    'OTHER_INSTAGRAM',
    'FRIENDS',
    'OTHER'
);


ALTER TYPE public."RylsDiscoverSource" OWNER TO postgres;

--
-- Name: RylsGender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RylsGender" AS ENUM (
    'FEMALE',
    'MALE',
    'PREFER_NOT_TO_SAY'
);


ALTER TYPE public."RylsGender" OWNER TO postgres;

--
-- Name: RylsRegistrationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RylsRegistrationStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'EXPIRED'
);


ALTER TYPE public."RylsRegistrationStatus" OWNER TO postgres;

--
-- Name: RylsScholarshipType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RylsScholarshipType" AS ENUM (
    'FULLY_FUNDED',
    'SELF_FUNDED'
);


ALTER TYPE public."RylsScholarshipType" OWNER TO postgres;

--
-- Name: TestimonialStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TestimonialStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'PENDING'
);


ALTER TYPE public."TestimonialStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'USER'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: academies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.academies (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    path_slug character varying(255) NOT NULL,
    description text,
    duration character varying(100),
    format character varying(100),
    category character varying(100),
    image_url character varying(500),
    rating double precision DEFAULT 0 NOT NULL,
    rating_count integer DEFAULT 0 NOT NULL,
    certificate boolean DEFAULT false NOT NULL,
    portfolio boolean DEFAULT false NOT NULL,
    status public."AcademyStatus" DEFAULT 'ACTIVE'::public."AcademyStatus" NOT NULL,
    meta_title character varying(255),
    meta_description character varying(500),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.academies OWNER TO postgres;

--
-- Name: academies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.academies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.academies_id_seq OWNER TO postgres;

--
-- Name: academies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.academies_id_seq OWNED BY public.academies.id;


--
-- Name: academy_enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.academy_enrollments (
    id integer NOT NULL,
    academy_id integer NOT NULL,
    user_id integer NOT NULL,
    pricing_tier_id integer,
    enrollment_status public."EnrollmentStatus" DEFAULT 'ENROLLED'::public."EnrollmentStatus" NOT NULL,
    progress_percentage integer DEFAULT 0 NOT NULL,
    enrolled_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at timestamp(3) without time zone
);


ALTER TABLE public.academy_enrollments OWNER TO postgres;

--
-- Name: academy_enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.academy_enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.academy_enrollments_id_seq OWNER TO postgres;

--
-- Name: academy_enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.academy_enrollments_id_seq OWNED BY public.academy_enrollments.id;


--
-- Name: academy_faqs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.academy_faqs (
    id integer NOT NULL,
    academy_id integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    "order" integer DEFAULT 1 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.academy_faqs OWNER TO postgres;

--
-- Name: academy_faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.academy_faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.academy_faqs_id_seq OWNER TO postgres;

--
-- Name: academy_faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.academy_faqs_id_seq OWNED BY public.academy_faqs.id;


--
-- Name: academy_features; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.academy_features (
    id integer NOT NULL,
    academy_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    icon character varying(100),
    "order" integer DEFAULT 1 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.academy_features OWNER TO postgres;

--
-- Name: academy_features_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.academy_features_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.academy_features_id_seq OWNER TO postgres;

--
-- Name: academy_features_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.academy_features_id_seq OWNED BY public.academy_features.id;


--
-- Name: academy_instructors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.academy_instructors (
    id integer NOT NULL,
    academy_id integer NOT NULL,
    name character varying(255) NOT NULL,
    job_title character varying(255),
    avatar_url character varying(500),
    description text,
    "order" integer DEFAULT 1 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.academy_instructors OWNER TO postgres;

--
-- Name: academy_instructors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.academy_instructors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.academy_instructors_id_seq OWNER TO postgres;

--
-- Name: academy_instructors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.academy_instructors_id_seq OWNED BY public.academy_instructors.id;


--
-- Name: academy_pricing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.academy_pricing (
    id integer NOT NULL,
    academy_id integer NOT NULL,
    name character varying(100) NOT NULL,
    original_price integer NOT NULL,
    discount_price integer NOT NULL,
    "order" integer DEFAULT 1 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.academy_pricing OWNER TO postgres;

--
-- Name: academy_pricing_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.academy_pricing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.academy_pricing_id_seq OWNER TO postgres;

--
-- Name: academy_pricing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.academy_pricing_id_seq OWNED BY public.academy_pricing.id;


--
-- Name: academy_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.academy_sessions (
    id integer NOT NULL,
    topic_id integer NOT NULL,
    title character varying(255) NOT NULL,
    "order" integer DEFAULT 1 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.academy_sessions OWNER TO postgres;

--
-- Name: academy_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.academy_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.academy_sessions_id_seq OWNER TO postgres;

--
-- Name: academy_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.academy_sessions_id_seq OWNED BY public.academy_sessions.id;


--
-- Name: academy_testimonials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.academy_testimonials (
    id integer NOT NULL,
    academy_id integer NOT NULL,
    name character varying(255) NOT NULL,
    avatar_url character varying(500),
    comment text NOT NULL,
    "order" integer DEFAULT 1 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.academy_testimonials OWNER TO postgres;

--
-- Name: academy_testimonials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.academy_testimonials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.academy_testimonials_id_seq OWNER TO postgres;

--
-- Name: academy_testimonials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.academy_testimonials_id_seq OWNED BY public.academy_testimonials.id;


--
-- Name: academy_topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.academy_topics (
    id integer NOT NULL,
    academy_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "order" integer DEFAULT 1 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.academy_topics OWNER TO postgres;

--
-- Name: academy_topics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.academy_topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.academy_topics_id_seq OWNER TO postgres;

--
-- Name: academy_topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.academy_topics_id_seq OWNED BY public.academy_topics.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    logo_url character varying(500),
    website_url character varying(500),
    industry character varying(255),
    headquarters character varying(255),
    description text,
    linkedin_url character varying(500),
    linkedin_slug character varying(255),
    linkedin_employees integer,
    linkedin_size character varying(100),
    linkedin_slogan character varying(500),
    linkedin_followers integer,
    linkedin_type character varying(100),
    linkedin_founded_date character varying(4),
    linkedin_specialties jsonb,
    linkedin_locations jsonb,
    linkedin_is_recruitment_agency boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: file_uploads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.file_uploads (
    id integer NOT NULL,
    original_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size integer NOT NULL,
    mime_type character varying(100) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    upload_type character varying(50) NOT NULL
);


ALTER TABLE public.file_uploads OWNER TO postgres;

--
-- Name: file_uploads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.file_uploads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.file_uploads_id_seq OWNER TO postgres;

--
-- Name: file_uploads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.file_uploads_id_seq OWNED BY public.file_uploads.id;


--
-- Name: job_ai_insights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_ai_insights (
    id integer NOT NULL,
    job_id integer NOT NULL,
    ai_salary_currency character varying(3),
    ai_salary_value integer,
    ai_salary_min_value integer,
    ai_salary_max_value integer,
    ai_salary_unit_text character varying(100),
    ai_benefits text,
    ai_experience_level character varying(100),
    ai_work_arrangement character varying(100),
    ai_work_arrangement_days integer,
    ai_remote_location character varying(255),
    ai_remote_location_derived character varying(255),
    ai_key_skills jsonb,
    ai_core_responsibilities text,
    ai_requirements_summary text,
    ai_working_hours character varying(100),
    ai_job_language character varying(100),
    ai_visa_sponsorship boolean,
    ai_hiring_manager_name character varying(255),
    ai_hiring_manager_email character varying(255),
    salary_confidence numeric(3,2),
    skills_confidence numeric(3,2),
    requirements_confidence numeric(3,2),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.job_ai_insights OWNER TO postgres;

--
-- Name: job_ai_insights_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_ai_insights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_ai_insights_id_seq OWNER TO postgres;

--
-- Name: job_ai_insights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_ai_insights_id_seq OWNED BY public.job_ai_insights.id;


--
-- Name: job_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_applications (
    id integer NOT NULL,
    job_id integer NOT NULL,
    user_id integer NOT NULL,
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    cover_letter text,
    resume_url character varying(500),
    applied_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    notes text
);


ALTER TABLE public.job_applications OWNER TO postgres;

--
-- Name: job_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_applications_id_seq OWNER TO postgres;

--
-- Name: job_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_applications_id_seq OWNED BY public.job_applications.id;


--
-- Name: job_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_locations (
    id integer NOT NULL,
    city character varying(255),
    region character varying(255),
    country character varying(255) NOT NULL,
    timezone character varying(100),
    latitude numeric(10,8),
    longitude numeric(11,8),
    raw_location_data jsonb,
    location_type character varying(100),
    is_remote boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.job_locations OWNER TO postgres;

--
-- Name: job_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_locations_id_seq OWNER TO postgres;

--
-- Name: job_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_locations_id_seq OWNED BY public.job_locations.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    company_id integer NOT NULL,
    location_id integer,
    description text NOT NULL,
    employment_type character varying(50) NOT NULL,
    seniority_level character varying(100),
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    direct_apply boolean DEFAULT true NOT NULL,
    external_url character varying(500),
    posted_date timestamp(3) without time zone NOT NULL,
    valid_until timestamp(3) without time zone,
    source_type character varying(100),
    source character varying(100),
    source_domain character varying(255),
    source_url character varying(500),
    linkedin_job_id character varying(255),
    recruiter_name character varying(255),
    recruiter_title character varying(255),
    recruiter_url character varying(500),
    salary_raw character varying(500),
    location_requirements_raw text,
    meta_title character varying(255),
    meta_description character varying(500),
    api_created_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: midtrans_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.midtrans_payments (
    id integer NOT NULL,
    order_id character varying(100) NOT NULL,
    snap_token character varying(255) NOT NULL,
    redirect_url character varying(500),
    transaction_id character varying(100),
    payment_type character varying(50),
    gross_amount_idr integer NOT NULL,
    currency character varying(10) DEFAULT 'IDR'::character varying NOT NULL,
    transaction_status public."MidtransTransactionStatus" DEFAULT 'pending'::public."MidtransTransactionStatus" NOT NULL,
    fraud_status public."MidtransFraudStatus",
    payment_details jsonb,
    last_notification jsonb,
    notified_at timestamp(3) without time zone,
    paid_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.midtrans_payments OWNER TO postgres;

--
-- Name: midtrans_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.midtrans_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.midtrans_payments_id_seq OWNER TO postgres;

--
-- Name: midtrans_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.midtrans_payments_id_seq OWNED BY public.midtrans_payments.id;


--
-- Name: programs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.programs (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    image character varying(500) NOT NULL,
    description text NOT NULL,
    status public."ProgramStatus" DEFAULT 'ACTIVE'::public."ProgramStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.programs OWNER TO postgres;

--
-- Name: programs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.programs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.programs_id_seq OWNER TO postgres;

--
-- Name: programs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.programs_id_seq OWNED BY public.programs.id;


--
-- Name: ryls_fully_funded_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ryls_fully_funded_submissions (
    id integer NOT NULL,
    registration_id integer NOT NULL,
    essay_topic text,
    essay_file_id integer,
    essay_description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ryls_fully_funded_submissions OWNER TO postgres;

--
-- Name: ryls_fully_funded_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ryls_fully_funded_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ryls_fully_funded_submissions_id_seq OWNER TO postgres;

--
-- Name: ryls_fully_funded_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ryls_fully_funded_submissions_id_seq OWNED BY public.ryls_fully_funded_submissions.id;


--
-- Name: ryls_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ryls_payments (
    id integer NOT NULL,
    registration_id integer,
    paid_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    midtrans_id integer,
    payment_proof_id integer,
    amount integer NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    type character varying(50) NOT NULL
);


ALTER TABLE public.ryls_payments OWNER TO postgres;

--
-- Name: ryls_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ryls_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ryls_payments_id_seq OWNER TO postgres;

--
-- Name: ryls_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ryls_payments_id_seq OWNED BY public.ryls_payments.id;


--
-- Name: ryls_registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ryls_registrations (
    id integer NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    residence character varying(255) NOT NULL,
    nationality character varying(255) NOT NULL,
    second_nationality character varying(255),
    whatsapp character varying(50) NOT NULL,
    institution character varying(255) NOT NULL,
    date_of_birth date NOT NULL,
    gender public."RylsGender" NOT NULL,
    discover_source public."RylsDiscoverSource" NOT NULL,
    discover_other_text text,
    scholarship_type public."RylsScholarshipType" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    ryls_payment_id integer
);


ALTER TABLE public.ryls_registrations OWNER TO postgres;

--
-- Name: ryls_registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ryls_registrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ryls_registrations_id_seq OWNER TO postgres;

--
-- Name: ryls_registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ryls_registrations_id_seq OWNED BY public.ryls_registrations.id;


--
-- Name: ryls_self_funded_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ryls_self_funded_submissions (
    id integer NOT NULL,
    registration_id integer NOT NULL,
    passport_number character varying(100) NOT NULL,
    need_visa boolean NOT NULL,
    headshot_file_id integer,
    read_policies boolean NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ryls_self_funded_submissions OWNER TO postgres;

--
-- Name: ryls_self_funded_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ryls_self_funded_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ryls_self_funded_submissions_id_seq OWNER TO postgres;

--
-- Name: ryls_self_funded_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ryls_self_funded_submissions_id_seq OWNED BY public.ryls_self_funded_submissions.id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value jsonb,
    description character varying(500),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_settings_id_seq OWNER TO postgres;

--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.testimonials (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    country character varying(100) NOT NULL,
    text text NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    status public."TestimonialStatus" DEFAULT 'ACTIVE'::public."TestimonialStatus" NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.testimonials OWNER TO postgres;

--
-- Name: testimonials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.testimonials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.testimonials_id_seq OWNER TO postgres;

--
-- Name: testimonials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.testimonials_id_seq OWNED BY public.testimonials.id;


--
-- Name: user_saved_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_saved_jobs (
    user_id integer NOT NULL,
    job_id integer NOT NULL,
    saved_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id integer NOT NULL
);


ALTER TABLE public.user_saved_jobs OWNER TO postgres;

--
-- Name: user_saved_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_saved_jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_saved_jobs_id_seq OWNER TO postgres;

--
-- Name: user_saved_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_saved_jobs_id_seq OWNED BY public.user_saved_jobs.id;


--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_settings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    key character varying(100),
    value jsonb
);


ALTER TABLE public.user_settings OWNER TO postgres;

--
-- Name: user_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_settings_id_seq OWNER TO postgres;

--
-- Name: user_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_settings_id_seq OWNED BY public.user_settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    avatar character varying(500),
    email character varying(255) NOT NULL,
    phone character varying(20),
    password character varying(255) NOT NULL,
    email_verified_at timestamp(3) without time zone,
    phone_verified_at timestamp(3) without time zone,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    gender public."Gender",
    country character varying(100),
    province character varying(100),
    city character varying(100),
    last_education character varying(255),
    current_job character varying(255),
    current_company character varying(255),
    skills text[],
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: academies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academies ALTER COLUMN id SET DEFAULT nextval('public.academies_id_seq'::regclass);


--
-- Name: academy_enrollments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_enrollments ALTER COLUMN id SET DEFAULT nextval('public.academy_enrollments_id_seq'::regclass);


--
-- Name: academy_faqs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_faqs ALTER COLUMN id SET DEFAULT nextval('public.academy_faqs_id_seq'::regclass);


--
-- Name: academy_features id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_features ALTER COLUMN id SET DEFAULT nextval('public.academy_features_id_seq'::regclass);


--
-- Name: academy_instructors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_instructors ALTER COLUMN id SET DEFAULT nextval('public.academy_instructors_id_seq'::regclass);


--
-- Name: academy_pricing id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_pricing ALTER COLUMN id SET DEFAULT nextval('public.academy_pricing_id_seq'::regclass);


--
-- Name: academy_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_sessions ALTER COLUMN id SET DEFAULT nextval('public.academy_sessions_id_seq'::regclass);


--
-- Name: academy_testimonials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_testimonials ALTER COLUMN id SET DEFAULT nextval('public.academy_testimonials_id_seq'::regclass);


--
-- Name: academy_topics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_topics ALTER COLUMN id SET DEFAULT nextval('public.academy_topics_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: file_uploads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_uploads ALTER COLUMN id SET DEFAULT nextval('public.file_uploads_id_seq'::regclass);


--
-- Name: job_ai_insights id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_ai_insights ALTER COLUMN id SET DEFAULT nextval('public.job_ai_insights_id_seq'::regclass);


--
-- Name: job_applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications ALTER COLUMN id SET DEFAULT nextval('public.job_applications_id_seq'::regclass);


--
-- Name: job_locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_locations ALTER COLUMN id SET DEFAULT nextval('public.job_locations_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: midtrans_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.midtrans_payments ALTER COLUMN id SET DEFAULT nextval('public.midtrans_payments_id_seq'::regclass);


--
-- Name: programs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.programs ALTER COLUMN id SET DEFAULT nextval('public.programs_id_seq'::regclass);


--
-- Name: ryls_fully_funded_submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ryls_fully_funded_submissions ALTER COLUMN id SET DEFAULT nextval('public.ryls_fully_funded_submissions_id_seq'::regclass);


--
-- Name: ryls_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ryls_payments ALTER COLUMN id SET DEFAULT nextval('public.ryls_payments_id_seq'::regclass);


--
-- Name: ryls_registrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ryls_registrations ALTER COLUMN id SET DEFAULT nextval('public.ryls_registrations_id_seq'::regclass);


--
-- Name: ryls_self_funded_submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ryls_self_funded_submissions ALTER COLUMN id SET DEFAULT nextval('public.ryls_self_funded_submissions_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Name: testimonials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials ALTER COLUMN id SET DEFAULT nextval('public.testimonials_id_seq'::regclass);


--
-- Name: user_saved_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_saved_jobs ALTER COLUMN id SET DEFAULT nextval('public.user_saved_jobs_id_seq'::regclass);


--
-- Name: user_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings ALTER COLUMN id SET DEFAULT nextval('public.user_settings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
6c4b88a3-20e9-4dce-a9cd-e203b957f206	099194ae1f19fb4f6b000515b79d1f8395ed2050f34b7878467c6cd076f3212b	2025-08-13 06:54:49.053277+07	20250812035115_make_file_relations_optional	\N	\N	2025-08-13 06:54:49.035704+07	1
986bd7ea-d23c-4364-bbac-33b420d113dc	f02b0384a70a547f0a14e9facf133b935d08177a9debd50100baabcc08837f9f	2025-07-23 07:41:31.234536+07	20250704013432_create_users_table	\N	\N	2025-07-23 07:41:31.166158+07	1
9ba01eb9-7dfd-4fd8-8cbd-8acd68f1f4b8	e24ff38856d6ec9381cc22f5c88c140e112e39296eeeab454f958f2c0e6ff989	2025-07-23 07:41:31.408718+07	20250711100320_create_bootcamp_tables	\N	\N	2025-07-23 07:41:31.23786+07	1
4ce91516-aff9-4964-a518-2f9d008bd300	feefcf88ef203f0d1b782fc7b30d2bcb9e5fccac6f90febd04d51a79eb9f77cf	2025-07-23 07:41:31.881304+07	20250711133128_create_jobs_tables_full_linkedin_api	\N	\N	2025-07-23 07:41:31.41111+07	1
c221bc18-83c0-4048-a29f-c9f50def8bda	4d89f937bf4f4c79853bb7ef231b7ac724b7103a03d8fbcef8414cbdf5646db8	2025-08-13 06:54:49.068448+07	20250812035815_make_essay_optional	\N	\N	2025-08-13 06:54:49.057857+07	1
f3fa3493-5c34-402b-a3d2-d1c78ebafe1d	8e463fdd4b9785a52d9fb46aea4e11d49223da7b92b808a041fbb5305de3b870	2025-07-23 07:41:31.964579+07	20250711141639_create_testimonials_table	\N	\N	2025-07-23 07:41:31.883246+07	1
86ceb3a6-df50-4ad3-a6e4-00fb1a038b39	96ca15190b9b0ffcef31c7752d1ca61ced44c3fe6e71632936c6d2f1e04383fd	2025-07-23 07:41:32.008795+07	20250711144337_create_programs_table	\N	\N	2025-07-23 07:41:31.967286+07	1
a1d9c924-8952-431e-a0aa-231781d4cf73	08322b80c043f368d626206bfca9b95bf8741449e55b8add6976c6b2d9e4130a	2025-08-13 06:54:48.374981+07	20250809134707_create_ryls_registration_tables	\N	\N	2025-08-13 06:54:48.019863+07	1
e79867a6-156b-4222-bc1e-17f30e8e1b8e	a53003c1c2ab1cce6615fc57f8c6719fb22519959766d70e892c4c152be06a8e	2025-09-30 00:22:27.921824+07	20250901051141_add_system_settings	\N	\N	2025-09-30 00:22:27.826011+07	1
9d8bf067-4b88-4e19-93cb-e513d3525aa9	66ab2b42ab8740a5a2846d191eea23048bab5dfdaa8e441719fcbd439b71d84b	2025-08-13 06:54:48.478685+07	20250810055205_add_ryls_payments	\N	\N	2025-08-13 06:54:48.377646+07	1
686c0d81-e4e0-48b7-8980-ac274904a8d4	18705e700f9293d8a18389ff5774458f965790a1cf93b7f034c872eca9d52b7f	2025-08-13 06:54:48.562834+07	20250810063931_ryls_registration_status_enum_update	\N	\N	2025-08-13 06:54:48.481348+07	1
233a5866-d40d-48b1-bf10-b3d4684df9f5	271f19537c69603caee288b23a48ec1e8645cd0cef59f801d8226322717a14f2	2025-09-30 00:47:33.35534+07	20250917124849_rename_order_column_and_denormalize_bootcamp_instructor	\N	\N	2025-09-30 00:47:33.180114+07	1
0f6fddab-88e1-445c-ad3d-cb51610b4f28	71234cf1f18086cb75930da7d7e5a669a194eb1b78024bf147ea13b0877e7981	2025-08-13 06:54:48.592444+07	20250811001917_rename_status_to_payment_status_drop_unique_email	\N	\N	2025-08-13 06:54:48.569446+07	1
ef115455-521c-429f-a0aa-eae147347952	9eb76e2c326c7c88102cc23a4d7df60cf8ac69774b178dc445708dc029756953	\N	20250917124849_rename_order_column_and_denormalize_bootcamp_instructor	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250917124849_rename_order_column_and_denormalize_bootcamp_instructor\n\nDatabase error code: 23502\n\nDatabase error:\nERROR: column "name" of relation "bootcamp_instructors" contains null values\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E23502), message: "column \\"name\\" of relation \\"bootcamp_instructors\\" contains null values", detail: None, hint: None, position: None, where_: None, schema: Some("public"), table: Some("bootcamp_instructors"), column: Some("name"), datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(6046), routine: Some("ATRewriteTable") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250917124849_rename_order_column_and_denormalize_bootcamp_instructor"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250917124849_rename_order_column_and_denormalize_bootcamp_instructor"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:236	2025-09-30 00:47:22.370857+07	2025-09-30 00:22:27.927782+07	0
7ce12782-19ec-453f-9f7f-e60de2a14f74	8f664aec33ffdcb291c80f2859ccbe1da66046c0101a5d311a0359efd7712895	2025-08-13 06:54:48.858762+07	20250811074010_update_payment_schema	\N	\N	2025-08-13 06:54:48.596579+07	1
c83b6fcc-64bf-4e0d-b63a-cb536b7b7e8f	077cc2b1c1eb21fde350f80fc97dee399e05c80c08a23ae60c78cab6fbd18b25	2025-08-13 06:54:49.014852+07	20250811080441_add_amount_to_ryls_payment	\N	\N	2025-08-13 06:54:48.862726+07	1
460444ec-a85e-42d5-a07e-043bf6f2bac6	b2c754bb79ae1453788ab68307af0dc54bbfbdf95cae1ca8fd5b276e598e74fd	2025-08-13 06:54:49.032627+07	20250811124438_update_registration_id_optional	\N	\N	2025-08-13 06:54:49.018533+07	1
1be34e5a-7eb1-476a-b2df-fdb7b761f874	aa5deda2997d06a8155e311802ec79e722edb638a745b6d2236cff5b04c730df	2025-09-30 00:47:33.708937+07	20250917131352_rename_bootcamp_to_academy	\N	\N	2025-09-30 00:47:33.357721+07	1
341da89d-fd3d-4338-bc88-389ff49a4849	d1abdc402cdd292e7cb4f31251fca99f4f852063d15d5e9ab96ca19565cfe8b8	\N	20250929190851_fix_user_settings_schema	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250929190851_fix_user_settings_schema\n\nDatabase error code: 23502\n\nDatabase error:\nERROR: column "key" of relation "user_settings" contains null values\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E23502), message: "column \\"key\\" of relation \\"user_settings\\" contains null values", detail: None, hint: None, position: None, where_: None, schema: Some("public"), table: Some("user_settings"), column: Some("key"), datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(6046), routine: Some("ATRewriteTable") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250929190851_fix_user_settings_schema"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250929190851_fix_user_settings_schema"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:236	2025-09-30 02:13:28.765318+07	2025-09-30 02:11:55.542906+07	0
16d9b5e7-c514-4fee-8a46-d467b4a39ecc	475d572e406b1ac6366276b5d36ac56de0f24c8c80070be221af321dd78a1e52	2025-09-30 02:13:33.646723+07	20250929190851_fix_user_settings_schema	\N	\N	2025-09-30 02:13:33.607263+07	1
\.


--
-- Data for Name: academies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.academies (id, title, path_slug, description, duration, format, category, image_url, rating, rating_count, certificate, portfolio, status, meta_title, meta_description, created_at, updated_at) FROM stdin;
1	ESG (Environmental, Social, and Governance)	esg-environmental-social-and-governance	The ESG Academy is an intensive program designed to equip participants with in-demand sustainability skills through 15 live classes led by ESG experts, interactive real-world case studies, and a job accelerator program. Participants will gain practical insights into Environmental, Social, and Governance (ESG) principles, sharpen their problem-solving abilities by working on industry-relevant challenges, and receive tailored career support including CV building, interview preparation, and access to ESG-related job and internship opportunities—making it ideal for students, young professionals, or career switchers looking to thrive in the sustainability sector.\r\n	3 months	Online Live Classes	ESG	https://api.risesocial.org/uploads/images/1759169547380-envato-labs-ai-9c9ce885-958f-4713-a157-7468b9ed0d55.jpg	0	0	t	t	ACTIVE	ESG (Environmental, Social, and Governance)	The ESG Academy is an intensive program designed to equip participants with in-demand sustainability skills through 15 live classes led by ESG experts, inter...	2025-09-29 18:12:27.386	2025-09-29 18:12:27.386
2	Sociopreneur	sociopreneur	The Sociopreneur Rise Social program is an intensive bootcamp designed to guide aspiring social entrepreneurs in transforming their vision into sustainable impact-driven businesses. From understanding the fundamentals of sociopreneurship, conducting problem analysis, and applying design thinking for ideation, to mapping stakeholders and capital resources, participants are equipped with the tools to build strong foundations for their ventures. The program also covers essential skills such as financial management, go-to-market strategies, pitching, branding, and social impact measurement. Through interactive sessions, case studies, and mentorship, Sociopreneur Rise Social serves as both a learning platform and an incubator that empowers participants to create innovative, measurable, and sustainable social solutions	3 months	Online Live Classes	Sosial Business	/images/stock-image/envato-labs-ai-277a431b-c290-41a0-a4fc-07b363d1a7a5.jpg	0	0	t	t	ACTIVE	Sociopreneur	The Sociopreneur Rise Social program is an intensive bootcamp designed to guide aspiring social entrepreneurs in transforming their vision into sustainable impact-driven businesses.	2025-09-16 08:13:01.97	2025-09-16 08:13:01.97
3	LCA (Life Cycle Assessment)	life-cycle-assessment	The LCA Mini Academy is an intensive short program that introduces the fundamentals of Life Cycle Assessment (LCA), from purpose, scope, and framework to Life Cycle Inventory (LCI) and Impact Assessment (LCIA). Participants will learn core concepts, practice using openLCA software, and apply their knowledge through real-world case studies, making it the perfect entry point for students, young professionals, or career switchers eager to build practical sustainability skills.	1 month	Online Live Classes	Sustainability	/images/stock-image/envato-labs-ai-9800312a-b542-4b5c-9f6e-ce5dfb5fe808.jpg	0	0	t	t	ACTIVE	LCA (Life Cycle Assessment)	The LCA Mini Academy is an intensive short program that introduces the fundamentals of Life Cycle Assessment (LCA), from purpose, scope, and framework to Life Cycle Inventory (LCI) and Impact Assessment (LCIA). Participants will learn core concepts, practice using openLCA software, and apply their knowledge through real-world case studies, making it the perfect entry point for students, young professionals, or career switchers eager to build practical sustainability skills.	2025-09-29 12:31:38.462	2025-09-29 12:31:38.462
\.


--
-- Data for Name: academy_enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.academy_enrollments (id, academy_id, user_id, pricing_tier_id, enrollment_status, progress_percentage, enrolled_at, completed_at) FROM stdin;
\.


--
-- Data for Name: academy_faqs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.academy_faqs (id, academy_id, question, answer, "order", created_at) FROM stdin;
3	1	Is this academy suitable for beginners?	Yes, we provide foundational materials at the beginning of the program, making it ideal for beginners. The most important thing is your commitment to learn.	1	2025-07-23 00:42:46.883
4	1	What is the format of the live classes?	Live classes are held once a week via Zoom, each lasting 2 hours. All sessions are recorded and accessible anytime.	2	2025-07-23 00:42:46.883
5	1	Is there a job placement guarantee?	We offer a Job Accelerator program with hiring partners, but there is no placement guarantee. What we do guarantee is career coaching and networking opportunities.	3	2025-07-23 00:42:46.883
6	1	Will I receive a certificate?	Yes, participants who complete the program will receive a certificate of completion from Rise Social, recognized by industry professionals.	4	2025-07-23 00:42:46.883
7	2	Is this academy suitable for beginners?	Yes, we provide foundational materials at the beginning of the program, making it ideal for beginners. The most important thing is your commitment to learn.	1	2025-09-16 00:03:05.018
8	2	What is the format of the live classes?	Live classes are held once a week via Zoom, each lasting 2 hours. All sessions are recorded and accessible anytime.	2	2025-09-16 00:03:05.018
9	2	Is there a job placement guarantee?	We offer a Job Accelerator program with hiring partners, but there is no placement guarantee. What we do guarantee is career coaching and networking opportunities.	3	2025-09-16 00:03:05.018
10	2	Will I receive a certificate?	Yes, participants who complete the program will receive a certificate of completion from Rise Social, recognized by industry professionals.	4	2025-09-16 00:03:05.018
11	3	Is this academy suitable for beginners?	Yes, we provide foundational materials at the beginning of the program, making it ideal for beginners. The most important thing is your commitment to learn.	1	2025-09-16 00:03:05.018
12	3	What is the format of the live classes?	Live classes are held once a week via Zoom, each lasting 2 hours. All sessions are recorded and accessible anytime.	2	2025-09-16 00:03:05.018
13	3	Is there a job placement guarantee?	We offer a Job Accelerator program with hiring partners, but there is no placement guarantee. What we do guarantee is career coaching and networking opportunities.	3	2025-09-16 00:03:05.018
14	3	Will I receive a certificate?	Yes, participants who complete the program will receive a certificate of completion from Rise Social, recognized by industry professionals.	4	2025-09-16 00:03:05.018
\.


--
-- Data for Name: academy_features; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.academy_features (id, academy_id, title, description, icon, "order", created_at) FROM stdin;
11	1	Full Stack Material + Real Study Case	Equip participants with full stack material in ESG + real study case	heroicons:clipboard-document-check	1	2025-07-23 00:42:46.869
12	1	Comprehensive Module	Comprehensive module, learn in 3 months with experts	heroicons:clipboard-document-list	2	2025-07-23 00:42:46.869
13	1	Talent Showcase	Talent showcase for companies with participant's presentation and portfolio	heroicons:presentation-chart-bar	3	2025-07-23 00:42:46.869
14	1	Job Accelerator	Access to job opportunities from our hiring partners	heroicons:briefcase	4	2025-07-23 00:42:46.869
15	2	Beginner-Friendly Classes	Carefully curated sessions designed for newcomers to social entrepreneurship—no prior experience needed.\n\n	heroicons:book-open	1	2025-09-16 08:22:36.073
16	2	15+ Live Class	Engage in over 15 interactive live sessions led by experienced ESG and social business experts.	heroicons:video-camera	2	2025-09-16 08:25:33.39
17	2	Mentorship from Social Business Practitioners	Learn directly from experienced social entrepreneurs who bring real-world insights and practical wisdom.\n\n	heroicons:chat-bubble-left-right	2	2025-09-16 08:22:36.094
18	2	Real Case Final Project	Apply your knowledge to solve actual challenges faced by social enterprises, culminating in a hands-on final project.\n\n	heroicons:document-magnifying-glass	4	2025-09-16 08:22:36.095
19	2	Business Mentoring for Top Participants	Selected participants will receive up to 3 months of personalized business mentoring—free of charge.\n\n	heroicons:sparkles	5	2025-09-16 08:22:36.096
20	2	Exclusive Class Experiences	Small group learning (maximum 15 participants) ensures personalized guidance and deeper engagement.\n\n	heroicons:adjustments-horizontal	6	2025-09-16 08:22:36.097
21	2	Business Matching & Demo Day	Showcase your venture to potential partners and investors during our curated demo day.\n\n	heroicons:briefcase	7	2025-09-16 08:22:36.098
22	2	Global Social Business Networking Access	Connect with a global community of changemakers, innovators, and impact-driven professionals.\n\n	heroicons:globe-europe-africa	8	2025-09-16 08:22:36.099
23	2	Business Operational Tools	Get access to essential templates and tools to streamline your business operations.\n	heroicons:wrench-screwdriver	9	2025-09-16 08:22:36.099
24	2	Impact Measurement Tools	Learn how to track, evaluate, and communicate the social impact of your business effectively.	heroicons:chart-pie	10	2025-09-16 08:22:36.101
25	3	Live session with experts	Engage in interactive live sessions led by professionals, giving you the chance to ask questions and gain direct insights.\n\n	heroicons:video-camera	1	2025-09-29 12:38:17.628
26	3	Lifetime Access to Materials\n	You'll have unlimited access to all course materials, session recordings, and resources, even after the academy ends.	heroicons:clipboard-document-check	1	2025-09-29 12:38:17.78
27	3	Beginner-Friendly Curriculum\n	Our curriculum is designed for complete beginners. No prior experience is required—we’ll guide you step-by-step from the fundamentals to an advanced level.\n\n	heroicons:book-open	1	2025-09-29 12:38:29.108
28	3	Exclusive Community Group\n	Join our vibrant and supportive community to connect with peers, share knowledge, and expand your professional network.\n\n	heroicons:chat-bubble-left-right	1	2025-09-29 12:38:29.186
29	3	Certificate of Completion	Receive a formal certificate to validate your new skills. This credential enhances your professional profile and boosts your credibility.\n\n	heroicons:clipboard-document-list	1	2025-09-29 12:38:29.379
30	3	CV and LinkedIn Profile Review\n	Get personalized feedback on your CV and LinkedIn profile from our mentors, ensuring you stand out to recruiters and land your dream job.	heroicons:sparkles	1	2025-09-29 12:38:29.442
31	3	Real-World Case Studies for Your Portfolio	Build a compelling portfolio by working on authentic, industry-relevant projects. This hands-on experience proves your skills to potential employers.\n\n	heroicons:document-magnifying-glass	1	2025-09-29 12:38:28.786
\.


--
-- Data for Name: academy_instructors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.academy_instructors (id, academy_id, name, job_title, avatar_url, description, "order", created_at, updated_at) FROM stdin;
3	1	Muamar	Sustainability & ESG Manager at Manufacture Company	https://api.risesocial.org/uploads/images/1759171923284-PP 2 - Muamar.jpeg		3	2025-09-29 18:52:03.31	2025-09-29 18:52:03.31
4	3	Dasy Agung O. 	ESG | Product Life Cycle Assessment & Carbon Footprint	https://api.risesocial.org/uploads/images/1759172120254-Pas_Photo_Agung BOX - Agung Ospaman.jpeg		1	2025-09-29 18:55:20.278	2025-09-29 18:55:20.278
5	2	Rival Norman	Founder ImpactSea	https://api.risesocial.org/uploads/images/1759172169785-Rival (1).png		1	2025-09-29 18:56:09.799	2025-09-29 18:56:09.799
6	2	Ranitya Nurlita	Founder WasteHub	https://api.risesocial.org/uploads/images/1759172200203-Ranitya Nurlita (1).png		2	2025-09-29 18:56:40.209	2025-09-29 18:56:40.209
1	1	Citra Nur Fadilah	Sustainability Analyst at Manufacture Automotive Company	https://api.risesocial.org/uploads/images/1759171853385-CITRA - Citra Nur Fadilah.jpeg		1	2025-09-29 18:50:53.543	2025-09-30 16:17:08.954
2	1	Norlina Pasaribu	ESG & Sustainability Specialist at Cladtek	https://api.risesocial.org/uploads/images/1759171896513-WhatsApp Image 2025-03-11 at 13.04.35_faf8c986 - Norlina Pasaribu.jpg		2	2025-09-29 18:51:36.578	2025-09-30 16:17:13.002
\.


--
-- Data for Name: academy_pricing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.academy_pricing (id, academy_id, name, original_price, discount_price, "order", created_at) FROM stdin;
1	1	1 Tema	2390000	1390000	1	2025-07-23 00:42:46.867
2	1	3 Tema	4790000	3790000	2	2025-07-23 00:42:46.867
7	2	1 Tema	9860000	5860000	1	2025-09-16 08:34:07.873
8	3	1 Tema	2590000	1590000	1	2025-09-29 12:32:52.994
\.


--
-- Data for Name: academy_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.academy_sessions (id, topic_id, title, "order", created_at) FROM stdin;
11	1	Perkenalan ESG	1	2025-07-23 00:42:46.872
12	1	Lingkungan (Environmental) dalam ESG	2	2025-07-23 00:42:46.872
13	1	Sosial (Social) dalam ESG	3	2025-07-23 00:42:46.872
14	1	Tata Kelola (Governance) dalam ESG	4	2025-07-23 00:42:46.872
15	1	Studi kasus	5	2025-07-23 00:42:46.872
16	2	Pendahuluan	1	2025-07-23 00:42:46.875
17	2	Perencanaan ESG dalam Bisnis dan Korporasi	2	2025-07-23 00:42:46.875
18	2	Implementasi ESG dalam Bisnis dan Korporasi	3	2025-07-23 00:42:46.875
19	2	Evaluasi penerapan ESG dalam bisnis dan korporasi	4	2025-07-23 00:42:46.875
20	2	Studi kasus	5	2025-07-23 00:42:46.875
21	3	Pendahuluan	1	2025-07-23 00:42:46.877
22	3	Persiapan penulisan ESG Report	2	2025-07-23 00:42:46.877
23	3	Penulisan dan Pelaporan ESG Report	3	2025-07-23 00:42:46.877
24	3	Evaluasi dan Analisis ESG Report	4	2025-07-23 00:42:46.877
25	3	Studi Kasus	5	2025-07-23 00:42:46.877
\.


--
-- Data for Name: academy_testimonials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.academy_testimonials (id, academy_id, name, avatar_url, comment, "order", created_at) FROM stdin;
4	2	Sari Dewi		The instructors are highly experienced and provide practical insights from the industry. Highly recommended for professionals looking to switch careers into sustainability.\n\n	2	2025-09-16 00:03:05.017
5	2	Ahmad Rahman		The program is well-structured. The live sessions are highly interactive and offer direct feedback from mentors.	3	2025-09-16 00:03:05.017
6	2	Erik Saputra		The materials are up-to-date and immediately applicable to my work in the sustainability department.	1	2025-09-16 00:03:05.017
7	3	Sari Dewi		The instructors are highly experienced and provide practical insights from the industry. Highly recommended for professionals looking to switch careers into sustainability.\n\n	2	2025-09-16 00:03:05.017
8	3	Ahmad Rahman		The program is well-structured. The live sessions are highly interactive and offer direct feedback from mentors.	3	2025-09-16 00:03:05.017
9	3	Erik Saputra		The materials are up-to-date and immediately applicable to my work in the sustainability department.	1	2025-09-16 00:03:05.017
1	1	Erik Saputra	\N	The materials are up-to-date and immediately applicable to my work in the sustainability department.	1	2025-07-23 00:42:46.882
2	1	Sari Dewi	\N	The instructors are highly experienced and provide practical insights from the industry. Highly recommended for professionals looking to switch careers into sustainability.	2	2025-07-23 00:42:46.882
3	1	Ahmad Rahman	\N	The program is well-structured. The live sessions are highly interactive and offer direct feedback from mentors.	3	2025-07-23 00:42:46.882
\.


--
-- Data for Name: academy_topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.academy_topics (id, academy_id, title, description, "order", created_at) FROM stdin;
1	1	Dasar-Dasar ESG	Memahami konsep dasar ESG, standar internasional, dan regulasi yang berlaku di berbagai industri.	1	2025-07-23 00:42:46.871
2	1	Penerapan ESG dalam Bisnis dan Korporasi	Mempelajari perencanaan, implementasi, hingga evaluasi ESG dalam bisnis dan korporasi.	2	2025-07-23 00:42:46.874
3	1	Pembuatan ESG Report	Mendalami pembuatan ESG report yang komprehensif dan sesuai standar internasional.	3	2025-07-23 00:42:46.876
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, name, slug, logo_url, website_url, industry, headquarters, description, linkedin_url, linkedin_slug, linkedin_employees, linkedin_size, linkedin_slogan, linkedin_followers, linkedin_type, linkedin_founded_date, linkedin_specialties, linkedin_locations, linkedin_is_recruitment_agency, created_at, updated_at) FROM stdin;
21	HR Energy	hrenergy	https://media.licdn.com/dms/image/v2/C4E0BAQHx1X8XInDiKA/company-logo_200_200/company-logo_200_200/0/1647423696990/hrenergy_logo?e=2147483647&v=beta&t=dSmrWQtGvggveDzWqMWTomQ0hoKbBqc1LyDpgpp9fvM	https://hrenergy.org/	Services for Renewable Energy	Kaunas	HR Energy is an international recruitment agency that specialises in the recruitment of skilled professionals in the field of innovative energy solutions across the Europe (Central and Eastern Europe, Southern Europe, The Nordics, the Baltic States and Ukraine) with hands-on experience in filling both technical and non-technical positions from entry to С-level.\n\nOur Agency has a specific expertise and focuses on cooperation with companies in the following sectors:\n- Solar energy\n- Wind energy\n- Energy Storage\n- Energy Delivery & Smart Grids\n- Power Trading\n- EV (Electromobility)\n- Biomass & Hydrogen\n- Energy Efficiency & Sustainability\n- Green Tech Finance & Energy Start-Ups\n\nWe strongly believe people make companies successful, and our Team will help you attract the best industry experts to strengthen your company in achieving an ambitious goals.	https://www.linkedin.com/company/hrenergy	hrenergy	6	2-10 employees	We're brining together skilled professionals and well-reputed companies in the field of innovative energy solutions	\N	Privately Held	2021	["HR Consulting", "HR", "Renewables", "Solar Energy", "Wind Energy", "Renewable Energy", "Recruitment", "Sourcing", "Recruitment Process Outsourcing", "RPO", "Executive Search", "Permanent Recruitment", "and Contract Recruitment"]	["Kaunas, LT", "Kyiv, UA"]	t	2025-09-29 19:18:43.881	2025-09-29 19:18:43.881
\.


--
-- Data for Name: file_uploads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.file_uploads (id, original_name, file_path, file_size, mime_type, created_at, upload_type) FROM stdin;
1	Vector (2).png	/www/wwwroot/risesocial-be/uploads/images/1755048588908-Vector (2).png	1549718	image/png	2025-08-13 01:29:49.143	HEADSHOT
2	Vector (1).png	/www/wwwroot/risesocial-be/uploads/images/1755048620535-Vector (1).png	10679	image/png	2025-08-13 01:30:20.541	PAYMENT_PROOF
3	Vector (1).png	/www/wwwroot/risesocial-be/uploads/images/1755049997807-Vector (1).png	10679	image/png	2025-08-13 01:53:17.929	PAYMENT_PROOF
4	inbound5527059825156053677.jpg	/www/wwwroot/risesocial-be/uploads/images/1755267335754-inbound5527059825156053677.jpg	375241	image/jpeg	2025-08-15 14:15:35.799	HEADSHOT
5	inbound8401491802233827567.jpg	/www/wwwroot/risesocial-be/uploads/images/1755267343434-inbound8401491802233827567.jpg	172194	image/jpeg	2025-08-15 14:15:43.489	HEADSHOT
6	U157234_vie-700x700_1754991170 (2).jpg	/www/wwwroot/risesocial-be/uploads/images/1755271998751-U157234_vie-700x700_1754991170 (2).jpg	391026	image/jpeg	2025-08-15 15:33:18.759	HEADSHOT
7	Screenshot 2025-08-16 at 2.12.05 AM.png	/www/wwwroot/risesocial-be/uploads/images/1755281549590-Screenshot 2025-08-16 at 2.12.05 AM.png	135962	image/png	2025-08-15 18:12:29.602	PAYMENT_PROOF
8	Sanaullah- Afghanistan.jpg	/www/wwwroot/risesocial-be/uploads/images/1755287467828-Sanaullah- Afghanistan.jpg	1284923	image/jpeg	2025-08-15 19:51:07.852	HEADSHOT
9	1000043248-removebg-preview.png	/www/wwwroot/risesocial-be/uploads/images/1755325555791-1000043248-removebg-preview.png	65113	image/png	2025-08-16 06:25:55.808	PAYMENT_PROOF
10	IMG_20250519_102458_410.jpg	/www/wwwroot/risesocial-be/uploads/images/1755327641792-IMG_20250519_102458_410.jpg	1123038	image/jpeg	2025-08-16 07:00:42.041	HEADSHOT
11	IMG_3795.jpeg	/www/wwwroot/risesocial-be/uploads/images/1755338694678-IMG_3795.jpeg	101406	image/jpeg	2025-08-16 10:04:54.727	HEADSHOT
12	IMG_9876.jpeg	/www/wwwroot/risesocial-be/uploads/images/1755339466214-IMG_9876.jpeg	1216845	image/jpeg	2025-08-16 10:17:46.405	HEADSHOT
13	IMG-20241022-WA0002_Original.jpeg	/www/wwwroot/risesocial-be/uploads/images/1755384360328-IMG-20241022-WA0002_Original.jpeg	266153	image/jpeg	2025-08-16 22:46:00.354	HEADSHOT
14	IMG_7136.jpg	/www/wwwroot/risesocial-be/uploads/images/1755406784462-IMG_7136.jpg	1465941	image/jpeg	2025-08-17 04:59:44.788	HEADSHOT
15	IMG_6297.jpeg	/www/wwwroot/risesocial-be/uploads/images/1755417364673-IMG_6297.jpeg	94924	image/jpeg	2025-08-17 07:56:04.687	PAYMENT_PROOF
16	1000016475.jpg	/www/wwwroot/risesocial-be/uploads/images/1755436850027-1000016475.jpg	202961	image/jpeg	2025-08-17 13:20:50.034	HEADSHOT
17	1000041318.jpg	/www/wwwroot/risesocial-be/uploads/images/1755441561223-1000041318.jpg	62345	image/jpeg	2025-08-17 14:39:21.229	HEADSHOT
18	IMG-20250625-WA0063(1).jpg	/www/wwwroot/risesocial-be/uploads/images/1755468382795-IMG-20250625-WA0063(1).jpg	122276	image/jpeg	2025-08-17 22:06:22.841	HEADSHOT
19	Maryluz Jamella Blancaflor_Headshot.JPG	/www/wwwroot/risesocial-be/uploads/images/1755524692142-Maryluz Jamella Blancaflor_Headshot.JPG	833149	image/jpeg	2025-08-18 13:44:52.356	HEADSHOT
20	IMG_20250510_163315_580.jpg	/www/wwwroot/risesocial-be/uploads/images/1755530684065-IMG_20250510_163315_580.jpg	1573047	image/jpeg	2025-08-18 15:24:44.581	HEADSHOT
21	Motivation Letter (1).png	/www/wwwroot/risesocial-be/uploads/images/1755573495854-Motivation Letter (1).png	70819	image/png	2025-08-19 03:18:15.867	PAYMENT_PROOF
22	inbound6624390141785115920.png	/www/wwwroot/risesocial-be/uploads/images/1755581369225-inbound6624390141785115920.png	514852	image/png	2025-08-19 05:29:29.294	HEADSHOT
23	1000020075.jpg	/www/wwwroot/risesocial-be/uploads/images/1755588651697-1000020075.jpg	3718074	image/jpeg	2025-08-19 07:30:51.94	HEADSHOT
24	8fb4f9363222808b09a3266e56cc8750.jpg	/www/wwwroot/risesocial-be/uploads/images/1755599021968-8fb4f9363222808b09a3266e56cc8750.jpg	33113	image/jpeg	2025-08-19 10:23:41.978	PAYMENT_PROOF
25	Application for Admission of Exchange Student_NGO NGUYEN HOANG LUU.jpg	/www/wwwroot/risesocial-be/uploads/images/1755601140808-Application for Admission of Exchange Student_NGO NGUYEN HOANG LUU.jpg	21156	image/jpeg	2025-08-19 10:59:00.814	HEADSHOT
26	NGO NGUYEN HOANG LUU.jpg	/www/wwwroot/risesocial-be/uploads/images/1755601156329-NGO NGUYEN HOANG LUU.jpg	21156	image/jpeg	2025-08-19 10:59:16.334	HEADSHOT
27	Picsart_25-08-10_11-23-49-624.jpg	/www/wwwroot/risesocial-be/uploads/images/1755601335469-Picsart_25-08-10_11-23-49-624.jpg	192996	image/jpeg	2025-08-19 11:02:15.531	HEADSHOT
28	Organizational Structure.png	/www/wwwroot/risesocial-be/uploads/images/1755610681246-Organizational Structure.png	36932	image/png	2025-08-19 13:38:01.252	PAYMENT_PROOF
29	Phiếu đánh giá TTGK - Trịnh Phương Hà - 2312150078.pdf	/www/wwwroot/risesocial-be/uploads/documents/1755610691822-Phiếu đánh giá TTGK - Trịnh Phương Hà - 2312150078.pdf	962383	application/pdf	2025-08-19 13:38:11.945	PAYMENT_PROOF
30	8584588.jpg	/www/wwwroot/risesocial-be/uploads/images/1755610705189-8584588.jpg	166179	image/jpeg	2025-08-19 13:38:25.192	PAYMENT_PROOF
31	photo_2024-05-22_15-22-53.jpg	/www/wwwroot/risesocial-be/uploads/images/1755611908399-photo_2024-05-22_15-22-53.jpg	42099	image/jpeg	2025-08-19 13:58:28.406	HEADSHOT
32	IMG_6957.jpeg	/www/wwwroot/risesocial-be/uploads/images/1755613495209-IMG_6957.jpeg	507074	image/jpeg	2025-08-19 14:24:55.282	HEADSHOT
33	image_2025-08-18_20-45-07.png	/www/wwwroot/risesocial-be/uploads/images/1755616657111-image_2025-08-18_20-45-07.png	196103	image/png	2025-08-19 15:17:37.116	PAYMENT_PROOF
34	image_2025-08-18_20-50-14.png	/www/wwwroot/risesocial-be/uploads/images/1755616674554-image_2025-08-18_20-50-14.png	212991	image/png	2025-08-19 15:17:54.56	PAYMENT_PROOF
35	IMG_3423.jpeg	/www/wwwroot/risesocial-be/uploads/images/1755617961384-IMG_3423.jpeg	503928	image/jpeg	2025-08-19 15:39:21.456	HEADSHOT
36	Ảnh chụp màn hình 2025-08-07 221016.png	/www/wwwroot/risesocial-be/uploads/images/1755649622151-Ảnh chụp màn hình 2025-08-07 221016.png	479260	image/png	2025-08-20 00:27:02.21	PAYMENT_PROOF
37	Ảnh chụp màn hình 2025-08-19 134149.png	/www/wwwroot/risesocial-be/uploads/images/1755649640030-Ảnh chụp màn hình 2025-08-19 134149.png	91532	image/png	2025-08-20 00:27:20.06	PAYMENT_PROOF
38	Gambar diri.jpg	/www/wwwroot/risesocial-be/uploads/images/1755656185758-Gambar diri.jpg	20549	image/jpeg	2025-08-20 02:16:25.768	HEADSHOT
39	Group B - Summary Schedule Session 2025_2026 - updated 11 Mac 2025.pdf	/www/wwwroot/risesocial-be/uploads/documents/1755657921023-Group B - Summary Schedule Session 2025_2026 - updated 11 Mac 2025.pdf	191556	application/pdf	2025-08-20 02:45:21.075	PAYMENT_PROOF
40	IMG_6424.jpeg	/www/wwwroot/risesocial-be/uploads/images/1755658130917-IMG_6424.jpeg	374625	image/jpeg	2025-08-20 02:48:50.946	HEADSHOT
41	IMG_4100.jpeg	/www/wwwroot/risesocial-be/uploads/images/1755683582484-IMG_4100.jpeg	3023429	image/jpeg	2025-08-20 09:53:02.976	HEADSHOT
42	inbound2840271420166517445.jpg	/www/wwwroot/risesocial-be/uploads/images/1755684539276-inbound2840271420166517445.jpg	109126	image/jpeg	2025-08-20 10:08:59.319	HEADSHOT
43	IMG_9634.png	/www/wwwroot/risesocial-be/uploads/images/1755686744799-IMG_9634.png	4475466	image/png	2025-08-20 10:45:44.865	PAYMENT_PROOF
44	IMG_9639.png	/www/wwwroot/risesocial-be/uploads/images/1755686770225-IMG_9639.png	234943	image/png	2025-08-20 10:46:10.271	PAYMENT_PROOF
45	comprovante.pdf	/www/wwwroot/risesocial-be/uploads/documents/1755695854728-comprovante.pdf	224750	application/pdf	2025-08-20 13:17:34.734	PAYMENT_PROOF
46	comprovante.pdf	/www/wwwroot/risesocial-be/uploads/documents/1755696010762-comprovante.pdf	224750	application/pdf	2025-08-20 13:20:10.779	PAYMENT_PROOF
47	image.png	/www/wwwroot/risesocial-be/uploads/images/1755696451179-image.png	6070	image/png	2025-08-20 13:27:31.182	HEADSHOT
48	Group 1 (3).png	/www/wwwroot/risesocial-be/uploads/images/1755705218648-Group 1 (3).png	1177453	image/png	2025-08-20 15:53:38.863	PAYMENT_PROOF
49	INVITATION SPECIAL.png	/www/wwwroot/risesocial-be/uploads/images/1755705591736-INVITATION SPECIAL.png	871233	image/png	2025-08-20 15:59:51.875	PAYMENT_PROOF
50	INVITATION SPECIAL.png	/www/wwwroot/risesocial-be/uploads/images/1755706224729-INVITATION SPECIAL.png	871233	image/png	2025-08-20 16:10:24.893	PAYMENT_PROOF
51	IMG_9850.jpeg	/www/wwwroot/risesocial-be/uploads/images/1755710775716-IMG_9850.jpeg	1072036	image/jpeg	2025-08-20 17:26:15.912	HEADSHOT
52	file-81.png	/www/wwwroot/risesocial-be/uploads/images/1755711826511-file-81.png	1177182	image/png	2025-08-20 17:43:47.124	PAYMENT_PROOF
53	file-81.png	/www/wwwroot/risesocial-be/uploads/images/1755711929801-file-81.png	1177182	image/png	2025-08-20 17:45:29.955	PAYMENT_PROOF
54	file-81.png	/www/wwwroot/risesocial-be/uploads/images/1755712123510-file-81.png	1177182	image/png	2025-08-20 17:48:43.752	PAYMENT_PROOF
55	file-15 (1).jpeg	/www/wwwroot/risesocial-be/uploads/images/1755712281884-file-15 (1).jpeg	94924	image/jpeg	2025-08-20 17:51:21.889	PAYMENT_PROOF
56	1755696010762-comprovante.pdf	/www/wwwroot/risesocial-be/uploads/documents/1755712386688-1755696010762-comprovante.pdf	224750	application/pdf	2025-08-20 17:53:06.697	PAYMENT_PROOF
57	file-9.png	/www/wwwroot/risesocial-be/uploads/images/1755712483359-file-9.png	65113	image/png	2025-08-20 17:54:43.365	PAYMENT_PROOF
58	1000147592.jpg	/www/wwwroot/risesocial-be/uploads/images/1755718432175-1000147592.jpg	281257	image/jpeg	2025-08-20 19:33:52.292	HEADSHOT
59	file-81.png	/www/wwwroot/risesocial-be/uploads/images/1755718440059-file-81.png	1177182	image/png	2025-08-20 19:34:00.095	PAYMENT_PROOF
60	xl.png	/www/wwwroot/risesocial-be/uploads/images/1755737065073-xl.png	5601	image/png	2025-08-21 00:44:25.324	PAYMENT_PROOF
61	comprovante.pdf	/www/wwwroot/risesocial-be/uploads/documents/1755744841120-comprovante.pdf	224750	application/pdf	2025-08-21 02:54:01.135	PAYMENT_PROOF
62	telkomsel.png	/www/wwwroot/risesocial-be/uploads/images/1755745491269-telkomsel.png	4500	image/png	2025-08-21 03:04:51.274	PAYMENT_PROOF
63	INVITATION SPECIAL.png	/www/wwwroot/risesocial-be/uploads/images/1755752057043-INVITATION SPECIAL.png	871233	image/png	2025-08-21 04:54:17.055	PAYMENT_PROOF
64	INVITATION SPECIAL.png	/www/wwwroot/risesocial-be/uploads/images/1755752106944-INVITATION SPECIAL.png	871233	image/png	2025-08-21 04:55:06.959	PAYMENT_PROOF
65	file-54.png	/www/wwwroot/risesocial-be/uploads/images/1755752923451-file-54.png	1177182	image/png	2025-08-21 05:08:43.461	PAYMENT_PROOF
66	file-54.png	/www/wwwroot/risesocial-be/uploads/images/1755753057073-file-54.png	1177182	image/png	2025-08-21 05:10:57.085	PAYMENT_PROOF
67	inbound9148290217739911833.jpg	/www/wwwroot/risesocial-be/uploads/images/1755766344906-inbound9148290217739911833.jpg	179480	image/jpeg	2025-08-21 08:52:24.955	HEADSHOT
68	inbound5334273904072763249.jpg	/www/wwwroot/risesocial-be/uploads/images/1755771095474-inbound5334273904072763249.jpg	272288	image/jpeg	2025-08-21 10:11:35.534	HEADSHOT
69	Mihir Profile .jpg	/www/wwwroot/risesocial-be/uploads/images/1755798171793-Mihir Profile .jpg	32608	image/jpeg	2025-08-21 17:42:51.8	HEADSHOT
70	69418a49-75ac-4a78-b7f0-bb38481a729e.jpeg	/www/wwwroot/risesocial-be/uploads/images/1755799208584-69418a49-75ac-4a78-b7f0-bb38481a729e.jpeg	65422	image/jpeg	2025-08-21 18:00:08.59	HEADSHOT
71	inbound2756428738898238652.png	/www/wwwroot/risesocial-be/uploads/images/1755806984052-inbound2756428738898238652.png	815059	image/png	2025-08-21 20:09:44.167	HEADSHOT
72	Screenshot_2025-08-22-14-15-10-84.jpg	/www/wwwroot/risesocial-be/uploads/images/1755844601522-Screenshot_2025-08-22-14-15-10-84.jpg	428975	image/jpeg	2025-08-22 06:36:41.642	HEADSHOT
73	TEB1024- COMPUTER SYSTEMS (2).pdf	/www/wwwroot/risesocial-be/uploads/documents/1755873337389-TEB1024- COMPUTER SYSTEMS (2).pdf	3045596	application/pdf	2025-08-22 14:35:37.782	PAYMENT_PROOF
74	9C7A2521 copie.jpg	/www/wwwroot/risesocial-be/uploads/images/1755934132652-9C7A2521 copie.jpg	7739015	image/jpeg	2025-08-23 07:28:53.309	HEADSHOT
75	Screenshot 2025-08-12 152020.png	/www/wwwroot/risesocial-be/uploads/images/1755937330937-Screenshot 2025-08-12 152020.png	562510	image/png	2025-08-23 08:22:10.958	HEADSHOT
76	inbound6441180018174764768.jpg	/www/wwwroot/risesocial-be/uploads/images/1755963276975-inbound6441180018174764768.jpg	624360	image/jpeg	2025-08-23 15:34:37.171	HEADSHOT
77	Payment Receipt - RYLS (Japan).pdf	/www/wwwroot/risesocial-be/uploads/documents/1756006651943-Payment Receipt - RYLS (Japan).pdf	38561	application/pdf	2025-08-24 03:37:31.955	PAYMENT_PROOF
78	Foto Mispa.jpg	/www/wwwroot/risesocial-be/uploads/images/1756108195657-Foto Mispa.jpg	502713	image/jpeg	2025-08-25 07:49:55.766	HEADSHOT
79	Receipt.pdf	/www/wwwroot/risesocial-be/uploads/documents/1756119380804-Receipt.pdf	161248	application/pdf	2025-08-25 10:56:20.845	PAYMENT_PROOF
80	image.jpg	/www/wwwroot/risesocial-be/uploads/images/1756173629308-image.jpg	1234559	image/jpeg	2025-08-26 02:00:29.442	HEADSHOT
81	images.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756175246895-images.jpeg	7827	image/jpeg	2025-08-26 02:27:26.986	PAYMENT_PROOF
82	IMG_1373.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756185264365-IMG_1373.jpeg	37946	image/jpeg	2025-08-26 05:14:24.374	HEADSHOT
83	IMG_2344.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756187392517-IMG_2344.jpeg	2051004	image/jpeg	2025-08-26 05:49:52.613	HEADSHOT
84	IMG_6124.png	/www/wwwroot/risesocial-be/uploads/images/1756189824968-IMG_6124.png	487795	image/png	2025-08-26 06:30:24.982	HEADSHOT
85	IMG_6402.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756190098216-IMG_6402.jpeg	231942	image/jpeg	2025-08-26 06:34:58.266	PAYMENT_PROOF
86	inbound6606205069414769256.jpg	/www/wwwroot/risesocial-be/uploads/images/1756201112738-inbound6606205069414769256.jpg	19934	image/jpeg	2025-08-26 09:38:32.749	HEADSHOT
87	Screenshot 2025-08-16 at 2.10.33 AM.png	/www/wwwroot/risesocial-be/uploads/images/1756221093310-Screenshot 2025-08-16 at 2.10.33 AM.png	74952	image/png	2025-08-26 15:11:33.419	PAYMENT_PROOF
88	P1290235 (1).JPG	/www/wwwroot/risesocial-be/uploads/images/1756221469603-P1290235 (1).JPG	4630528	image/jpeg	2025-08-26 15:17:49.734	HEADSHOT
89	WhatsApp Image 2025-05-20 at 2.16.01 PM.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756221921616-WhatsApp Image 2025-05-20 at 2.16.01 PM.jpeg	297928	image/jpeg	2025-08-26 15:25:21.673	HEADSHOT
90	_MG_6755.jpg	/www/wwwroot/risesocial-be/uploads/images/1756222653887-_MG_6755.jpg	201710	image/jpeg	2025-08-26 15:37:33.913	HEADSHOT
91	IMG_2534.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756222999101-IMG_2534.jpeg	313628	image/jpeg	2025-08-26 15:43:19.157	HEADSHOT
92	image.jpg	/www/wwwroot/risesocial-be/uploads/images/1756230816192-image.jpg	1431294	image/jpeg	2025-08-26 17:53:36.413	HEADSHOT
93	IMG_20250826_165846.jpg	/www/wwwroot/risesocial-be/uploads/images/1756238442655-IMG_20250826_165846.jpg	104842	image/jpeg	2025-08-26 20:00:42.698	HEADSHOT
94	FOTO.jpg	/www/wwwroot/risesocial-be/uploads/images/1756260702153-FOTO.jpg	83002	image/jpeg	2025-08-27 02:11:42.176	HEADSHOT
95	IMG_3989.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756275267928-IMG_3989.jpeg	1102300	image/jpeg	2025-08-27 06:14:28.2	HEADSHOT
96	14133-IMG_0052.JPG	/www/wwwroot/risesocial-be/uploads/images/1756275422030-14133-IMG_0052.JPG	2636299	image/jpeg	2025-08-27 06:17:02.504	HEADSHOT
97	Untitled design.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756275484320-Untitled design.jpeg	205229	image/jpeg	2025-08-27 06:18:04.327	HEADSHOT
98	inbound2152250738783390445.jpg	/www/wwwroot/risesocial-be/uploads/images/1756276460215-inbound2152250738783390445.jpg	437934	image/jpeg	2025-08-27 06:34:20.229	HEADSHOT
99	inbound4839212170531724184.jpg	/www/wwwroot/risesocial-be/uploads/images/1756277619260-inbound4839212170531724184.jpg	3526703	image/jpeg	2025-08-27 06:53:39.326	HEADSHOT
100	inbound8959121050053120262.jpg	/www/wwwroot/risesocial-be/uploads/images/1756277734075-inbound8959121050053120262.jpg	3526703	image/jpeg	2025-08-27 06:55:34.111	HEADSHOT
101	photo_2025-08-10_14-18-03.jpg	/www/wwwroot/risesocial-be/uploads/images/1756279006119-photo_2025-08-10_14-18-03.jpg	97766	image/jpeg	2025-08-27 07:16:46.16	HEADSHOT
102	[LDHA] Resume.pdf	/www/wwwroot/risesocial-be/uploads/documents/1756281492519-[LDHA] Resume.pdf	156997	application/pdf	2025-08-27 07:58:12.533	PAYMENT_PROOF
103	inbound985530802885264363.jpg	/www/wwwroot/risesocial-be/uploads/images/1756281908137-inbound985530802885264363.jpg	414848	image/jpeg	2025-08-27 08:05:08.158	PAYMENT_PROOF
104	inbound6387038610107730080.jpg	/www/wwwroot/risesocial-be/uploads/images/1756284313490-inbound6387038610107730080.jpg	451532	image/jpeg	2025-08-27 08:45:13.513	HEADSHOT
105	inbound5893584031676551808.jpg	/www/wwwroot/risesocial-be/uploads/images/1756284363965-inbound5893584031676551808.jpg	451532	image/jpeg	2025-08-27 08:46:03.98	HEADSHOT
106	IMG_1253.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756287362473-IMG_1253.jpeg	135386	image/jpeg	2025-08-27 09:36:02.513	PAYMENT_PROOF
107	pass.jpg	/www/wwwroot/risesocial-be/uploads/images/1756291651053-pass.jpg	359509	image/jpeg	2025-08-27 10:47:31.1	HEADSHOT
108	WhatsApp Image 2025-07-31 at 3.01.36 PM.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756292769313-WhatsApp Image 2025-07-31 at 3.01.36 PM.jpeg	58612	image/jpeg	2025-08-27 11:06:09.32	HEADSHOT
109	1000035836.jpg	/www/wwwroot/risesocial-be/uploads/images/1756302496333-1000035836.jpg	651830	image/jpeg	2025-08-27 13:48:16.507	HEADSHOT
110	RUIDefcd71de01fe4e15ad583fa3504ebb12.png	/www/wwwroot/risesocial-be/uploads/images/1756302699261-RUIDefcd71de01fe4e15ad583fa3504ebb12.png	836929	image/png	2025-08-27 13:51:39.333	PAYMENT_PROOF
111	IMG-20250826-WA0078.jpg	/www/wwwroot/risesocial-be/uploads/images/1756304174974-IMG-20250826-WA0078.jpg	134645	image/jpeg	2025-08-27 14:16:14.996	HEADSHOT
112	Снимок экрана 2025-08-27 в 11.40.57.png	/www/wwwroot/risesocial-be/uploads/images/1756312868797-Снимок экрана 2025-08-27 в 11.40.57.png	137822	image/png	2025-08-27 16:41:08.811	PAYMENT_PROOF
113	-9h1dhx.jpg	/www/wwwroot/risesocial-be/uploads/images/1756318812420--9h1dhx.jpg	461593	image/jpeg	2025-08-27 18:20:12.51	HEADSHOT
114	Idowu Sunday Passport.jpg	/www/wwwroot/risesocial-be/uploads/images/1756319292729-Idowu Sunday Passport.jpg	57334	image/jpeg	2025-08-27 18:28:12.738	HEADSHOT
115	IMG_0951.png	/www/wwwroot/risesocial-be/uploads/images/1756344843569-IMG_0951.png	1073564	image/png	2025-08-28 01:34:03.59	HEADSHOT
116	Screenshot_20250808_221856_Gallery.jpg	/www/wwwroot/risesocial-be/uploads/images/1756370538720-Screenshot_20250808_221856_Gallery.jpg	93188	image/jpeg	2025-08-28 08:42:18.736	HEADSHOT
117	DF8261FA-DB8C-4247-A3BE-C22F7C327539.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756396621113-DF8261FA-DB8C-4247-A3BE-C22F7C327539.jpeg	406060	image/jpeg	2025-08-28 15:57:01.183	HEADSHOT
118	Imagen de WhatsApp 2025-08-27 a las 18.33.31_d9c7229d.jpg	/www/wwwroot/risesocial-be/uploads/images/1756396883886-Imagen de WhatsApp 2025-08-27 a las 18.33.31_d9c7229d.jpg	210053	image/jpeg	2025-08-28 16:01:23.947	HEADSHOT
119	rakesh.JPG	/www/wwwroot/risesocial-be/uploads/images/1756398050942-rakesh.JPG	42401	image/jpeg	2025-08-28 16:20:50.953	HEADSHOT
120	IMG-20250828-WA0045.jpg	/www/wwwroot/risesocial-be/uploads/images/1756436320019-IMG-20250828-WA0045.jpg	107791	image/jpeg	2025-08-29 02:58:40.06	HEADSHOT
121	Nabilah Aisyah Masbuchin_Payment_Rise Young Leaders Summit Japan 2025.pdf	/www/wwwroot/risesocial-be/uploads/documents/1756443027684-Nabilah Aisyah Masbuchin_Payment_Rise Young Leaders Summit Japan 2025.pdf	38309	application/pdf	2025-08-29 04:50:27.708	PAYMENT_PROOF
122	1000226283.jpg	/www/wwwroot/risesocial-be/uploads/images/1756445675526-1000226283.jpg	151917	image/jpeg	2025-08-29 05:34:35.533	HEADSHOT
123	pasfoto biru naysek.png	/www/wwwroot/risesocial-be/uploads/images/1756464628370-pasfoto biru naysek.png	204669	image/png	2025-08-29 10:50:28.379	HEADSHOT
124	IMG_8095.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756540274283-IMG_8095.jpeg	2984959	image/jpeg	2025-08-30 07:51:14.37	HEADSHOT
125	9567.jpg	/www/wwwroot/risesocial-be/uploads/images/1756543627414-9567.jpg	78322	image/jpeg	2025-08-30 08:47:07.444	HEADSHOT
126	9567.jpg	/www/wwwroot/risesocial-be/uploads/images/1756543709463-9567.jpg	78322	image/jpeg	2025-08-30 08:48:29.471	HEADSHOT
127	9567.jpg	/www/wwwroot/risesocial-be/uploads/images/1756543761902-9567.jpg	78322	image/jpeg	2025-08-30 08:49:21.91	HEADSHOT
128	Payment Receipt - RYLS (Japan).pdf	/www/wwwroot/risesocial-be/uploads/documents/1756561573655-Payment Receipt - RYLS (Japan).pdf	38561	application/pdf	2025-08-30 13:46:13.694	PAYMENT_PROOF
129	Screenshot_20250831_001506_Gmail.jpg	/www/wwwroot/risesocial-be/uploads/images/1756570514567-Screenshot_20250831_001506_Gmail.jpg	205239	image/jpeg	2025-08-30 16:15:14.661	PAYMENT_PROOF
130	5х5.jpg	/www/wwwroot/risesocial-be/uploads/images/1756571165018-5х5.jpg	125309	image/jpeg	2025-08-30 16:26:05.059	HEADSHOT
131	PayPal_ Transaction Details.pdf	/www/wwwroot/risesocial-be/uploads/documents/1756577675041-PayPal_ Transaction Details.pdf	110763	application/pdf	2025-08-30 18:14:35.181	PAYMENT_PROOF
132	PayPal_ Transaction Details.pdf	/www/wwwroot/risesocial-be/uploads/documents/1756599262148-PayPal_ Transaction Details.pdf	61356	application/pdf	2025-08-31 00:14:22.591	PAYMENT_PROOF
133	10.JPG	/www/wwwroot/risesocial-be/uploads/images/1756661012146-10.JPG	1291620	image/jpeg	2025-08-31 17:23:32.901	HEADSHOT
134	IMG_6908.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756716705500-IMG_6908.jpeg	3341901	image/jpeg	2025-09-01 08:51:46.196	HEADSHOT
135	IMG_2359.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756724121448-IMG_2359.jpeg	31838	image/jpeg	2025-09-01 10:55:21.568	HEADSHOT
136	IMG_2359.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756724219918-IMG_2359.jpeg	31838	image/jpeg	2025-09-01 10:56:59.924	HEADSHOT
137	WhatsApp Image 2023-12-03 at 2.40.45 PM (1).jpeg	/www/wwwroot/risesocial-be/uploads/images/1756735791687-WhatsApp Image 2023-12-03 at 2.40.45 PM (1).jpeg	83720	image/jpeg	2025-09-01 14:09:52.06	HEADSHOT
138	IMG_20250901_170950.jpg	/www/wwwroot/risesocial-be/uploads/images/1756736581937-IMG_20250901_170950.jpg	4126828	image/jpeg	2025-09-01 14:23:02.646	HEADSHOT
139	1000005097.png	/www/wwwroot/risesocial-be/uploads/images/1756738942650-1000005097.png	493024	image/png	2025-09-01 15:02:22.78	HEADSHOT
140	1000004806.jpg	/www/wwwroot/risesocial-be/uploads/images/1756738970148-1000004806.jpg	2706483	image/jpeg	2025-09-01 15:02:50.286	HEADSHOT
141	IMG_3384.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756812600056-IMG_3384.jpeg	334866	image/jpeg	2025-09-02 11:30:00.166	PAYMENT_PROOF
142	Ludwig_Sophie-Marie_Proof_Payment.png	/www/wwwroot/risesocial-be/uploads/images/1756812892193-Ludwig_Sophie-Marie_Proof_Payment.png	176589	image/png	2025-09-02 11:34:52.252	PAYMENT_PROOF
143	IMG_0498.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756816883461-IMG_0498.jpeg	567554	image/jpeg	2025-09-02 12:41:23.665	HEADSHOT
144	[Ario Waskito] Attachment Pembayaran Registrasi Rise Social .pdf	/www/wwwroot/risesocial-be/uploads/documents/1756818347541-[Ario Waskito] Attachment Pembayaran Registrasi Rise Social .pdf	197289	application/pdf	2025-09-02 13:05:47.593	PAYMENT_PROOF
145	IMG_0082.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756823397600-IMG_0082.jpeg	35593	image/jpeg	2025-09-02 14:29:57.693	HEADSHOT
146	CV_Nguyễn Hà Thảo Trang.pdf	/www/wwwroot/risesocial-be/uploads/documents/1756826301255-CV_Nguyễn Hà Thảo Trang.pdf	112050	application/pdf	2025-09-02 15:18:21.371	PAYMENT_PROOF
147	cd6a24f1797ee709fcfa42d6c0795d66.png	/www/wwwroot/risesocial-be/uploads/images/1756843796143-cd6a24f1797ee709fcfa42d6c0795d66.png	83355	image/png	2025-09-02 20:09:56.86	PAYMENT_PROOF
148	fotokimyperfil.jpg	/www/wwwroot/risesocial-be/uploads/images/1756844576896-fotokimyperfil.jpg	235047	image/jpeg	2025-09-02 20:22:57.004	HEADSHOT
149	IMG_7664.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756880772631-IMG_7664.jpeg	80700	image/jpeg	2025-09-03 06:26:13.365	HEADSHOT
150	IMG_7664.jpeg	/www/wwwroot/risesocial-be/uploads/images/1756880858688-IMG_7664.jpeg	80700	image/jpeg	2025-09-03 06:27:38.729	HEADSHOT
151	IMG_9432.png	/www/wwwroot/risesocial-be/uploads/images/1756885286155-IMG_9432.png	180721	image/png	2025-09-03 07:41:26.527	PAYMENT_PROOF
152	IMG_9432.png	/www/wwwroot/risesocial-be/uploads/images/1756886355686-IMG_9432.png	180721	image/png	2025-09-03 07:59:15.883	PAYMENT_PROOF
153	IMG_9432.png	/www/wwwroot/risesocial-be/uploads/images/1756890803165-IMG_9432.png	180721	image/png	2025-09-03 09:13:23.907	PAYMENT_PROOF
154	20250522_133437.jpg	/www/wwwroot/risesocial-be/uploads/images/1757014076621-20250522_133437.jpg	918206	image/jpeg	2025-09-04 19:27:56.855	HEADSHOT
155	IMG_5573.JPG	/www/wwwroot/risesocial-be/uploads/images/1757023984641-IMG_5573.JPG	150382	image/jpeg	2025-09-04 22:13:04.664	HEADSHOT
156	12.jpg	/www/wwwroot/risesocial-be/uploads/images/1757036453313-12.jpg	846819	image/jpeg	2025-09-05 01:40:53.482	PAYMENT_PROOF
157	IMG-20240527-WA0074.jpg	/www/wwwroot/risesocial-be/uploads/images/1757048097956-IMG-20240527-WA0074.jpg	16720	image/jpeg	2025-09-05 04:54:57.961	HEADSHOT
158	IMG_0572.png	/www/wwwroot/risesocial-be/uploads/images/1757054390373-IMG_0572.png	247821	image/png	2025-09-05 06:39:50.422	PAYMENT_PROOF
159	WP 20204.jpg	/www/wwwroot/risesocial-be/uploads/images/1757056139963-WP 20204.jpg	2373639	image/jpeg	2025-09-05 07:09:00.411	HEADSHOT
160	IMG_5170.jpeg	/www/wwwroot/risesocial-be/uploads/images/1757111260311-IMG_5170.jpeg	2659011	image/jpeg	2025-09-05 22:27:40.899	HEADSHOT
161	IMG_9867.jpeg	/www/wwwroot/risesocial-be/uploads/images/1757158081866-IMG_9867.jpeg	3323395	image/jpeg	2025-09-06 11:28:02.291	HEADSHOT
162	Ahmed Khalid Picture (1).jpg	/www/wwwroot/risesocial-be/uploads/images/1757217392565-Ahmed Khalid Picture (1).jpg	16013	image/jpeg	2025-09-07 03:56:32.587	HEADSHOT
163	davone.png	/www/wwwroot/risesocial-be/uploads/images/1757219972054-davone.png	60849	image/png	2025-09-07 04:39:32.077	HEADSHOT
164	davone.png	/www/wwwroot/risesocial-be/uploads/images/1757220216315-davone.png	60849	image/png	2025-09-07 04:43:36.324	HEADSHOT
165	WhatsApp Image 2025-09-07 at 17.04.23.jpeg	/www/wwwroot/risesocial-be/uploads/images/1757244882888-WhatsApp Image 2025-09-07 at 17.04.23.jpeg	47879	image/jpeg	2025-09-07 11:34:42.896	PAYMENT_PROOF
166	WhatsApp Image 2025-09-07 at 17.04.23.jpeg	/www/wwwroot/risesocial-be/uploads/images/1757245595926-WhatsApp Image 2025-09-07 at 17.04.23.jpeg	47879	image/jpeg	2025-09-07 11:46:35.939	PAYMENT_PROOF
167	POLSC 136.10 (1).pdf	/www/wwwroot/risesocial-be/uploads/documents/1757248180512-POLSC 136.10 (1).pdf	108375	application/pdf	2025-09-07 12:29:40.556	PAYMENT_PROOF
168	Formal_white-547x820.JPG	/www/wwwroot/risesocial-be/uploads/images/1757261268755-Formal_white-547x820.JPG	100117	image/jpeg	2025-09-07 16:07:48.788	HEADSHOT
169	Formal_white-547x820.JPG	/www/wwwroot/risesocial-be/uploads/images/1757261440157-Formal_white-547x820.JPG	100117	image/jpeg	2025-09-07 16:10:40.22	HEADSHOT
170	55D6BE0E-5F5F-4071-B3A6-579EA5CB0A0F.pdf	/www/wwwroot/risesocial-be/uploads/documents/1757272453133-55D6BE0E-5F5F-4071-B3A6-579EA5CB0A0F.pdf	178410	application/pdf	2025-09-07 19:14:13.23	PAYMENT_PROOF
171	HitotsubashiICS_Brochure_INTAKE 2026_fin_圧縮.pdf	/www/wwwroot/risesocial-be/uploads/documents/1757324142466-HitotsubashiICS_Brochure_INTAKE 2026_fin_圧縮.pdf	3013598	application/pdf	2025-09-08 09:35:42.59	PAYMENT_PROOF
172	WhatsApp Image 2025-08-30 at 11.50.09 AM.jpeg	/www/wwwroot/risesocial-be/uploads/images/1757361851465-WhatsApp Image 2025-08-30 at 11.50.09 AM.jpeg	78375	image/jpeg	2025-09-08 20:04:11.477	HEADSHOT
173	Screenshot_30-8-2025_141923_www.sathyasai.org.jpeg	/www/wwwroot/risesocial-be/uploads/images/1757394157885-Screenshot_30-8-2025_141923_www.sathyasai.org.jpeg	74778	image/jpeg	2025-09-09 05:02:37.942	PAYMENT_PROOF
174	IMG_7363.jpeg	/www/wwwroot/risesocial-be/uploads/images/1757397932922-IMG_7363.jpeg	258382	image/jpeg	2025-09-09 06:05:32.937	HEADSHOT
175	1.jpg	/www/wwwroot/risesocial-be/uploads/images/1757520599184-1.jpg	8341122	image/jpeg	2025-09-10 16:10:00.331	HEADSHOT
176	PayPal_ Transaction Details.pdf	/www/wwwroot/risesocial-be/uploads/documents/1757537519927-PayPal_ Transaction Details.pdf	282711	application/pdf	2025-09-10 20:51:59.939	PAYMENT_PROOF
177	Gambar pasport.jpg	/www/wwwroot/risesocial-be/uploads/images/1757564230539-Gambar pasport.jpg	42411	image/jpeg	2025-09-11 04:17:10.55	HEADSHOT
178	PF LAB BSCS JATIN KUMAR.pdf	/www/wwwroot/risesocial-be/uploads/documents/1757593894817-PF LAB BSCS JATIN KUMAR.pdf	3284492	application/pdf	2025-09-11 12:31:34.848	PAYMENT_PROOF
179	IMG_0808.png	/www/wwwroot/risesocial-be/uploads/images/1757605181653-IMG_0808.png	325539	image/png	2025-09-11 15:39:41.717	PAYMENT_PROOF
180	фото для документов.jpg	/www/wwwroot/risesocial-be/uploads/images/1757611873224-фото для документов.jpg	21846	image/jpeg	2025-09-11 17:31:13.325	HEADSHOT
181	Фото для документов Баранов А.В..jpg	/www/wwwroot/risesocial-be/uploads/images/1757613282579-Фото для документов Баранов А.В..jpg	30013	image/jpeg	2025-09-11 17:54:42.585	HEADSHOT
182	c3209d22889uf20250725100010.pdf	/www/wwwroot/risesocial-be/uploads/documents/1757654854590-c3209d22889uf20250725100010.pdf	156000	application/pdf	2025-09-12 05:27:34.629	PAYMENT_PROOF
183	IMG_3827.jpeg	/www/wwwroot/risesocial-be/uploads/images/1757692984283-IMG_3827.jpeg	90223	image/jpeg	2025-09-12 16:03:04.299	HEADSHOT
184	RISE SOCIAL RECEIPT.pdf	/www/wwwroot/risesocial-be/uploads/documents/1757736248120-RISE SOCIAL RECEIPT.pdf	61303	application/pdf	2025-09-13 04:04:08.158	PAYMENT_PROOF
185	IMG_8110 - Copy.jpeg	/www/wwwroot/risesocial-be/uploads/images/1757740520868-IMG_8110 - Copy.jpeg	149623	image/jpeg	2025-09-13 05:15:20.878	HEADSHOT
186	Special Invitation.png	/www/wwwroot/risesocial-be/uploads/images/1757812645757-Special Invitation.png	836929	image/png	2025-09-14 01:17:25.891	PAYMENT_PROOF
187	image.jpg	/www/wwwroot/risesocial-be/uploads/images/1757840337183-image.jpg	973543	image/jpeg	2025-09-14 08:58:57.332	HEADSHOT
188	Special Invitation.png	/www/wwwroot/risesocial-be/uploads/images/1757844562853-Special Invitation.png	836929	image/png	2025-09-14 10:09:23.13	PAYMENT_PROOF
189	IMG_3785.JPG	/www/wwwroot/risesocial-be/uploads/images/1757846548689-IMG_3785.JPG	1222933	image/jpeg	2025-09-14 10:42:28.705	HEADSHOT
190	inbound1563919068671792577.jpg	/www/wwwroot/risesocial-be/uploads/images/1757856494698-inbound1563919068671792577.jpg	291825	image/jpeg	2025-09-14 13:28:14.705	HEADSHOT
191	inbound3994327408476090680.png	/www/wwwroot/risesocial-be/uploads/images/1757856628113-inbound3994327408476090680.png	2988139	image/png	2025-09-14 13:30:28.884	HEADSHOT
192	inbound4513048515935913163.jpg	/www/wwwroot/risesocial-be/uploads/images/1757856846066-inbound4513048515935913163.jpg	2542726	image/jpeg	2025-09-14 13:34:06.307	HEADSHOT
193	inbound9110526485723704583.jpg	/www/wwwroot/risesocial-be/uploads/images/1757856883380-inbound9110526485723704583.jpg	1315391	image/jpeg	2025-09-14 13:34:43.39	HEADSHOT
194	inbound7031633293124350788.jpg	/www/wwwroot/risesocial-be/uploads/images/1757856887379-inbound7031633293124350788.jpg	256384	image/jpeg	2025-09-14 13:34:47.384	HEADSHOT
195	8616E786-E488-4892-89D9-7C5D793F9378.jpeg	/www/wwwroot/risesocial-be/uploads/images/1757885127176-8616E786-E488-4892-89D9-7C5D793F9378.jpeg	1876736	image/jpeg	2025-09-14 21:25:28.775	HEADSHOT
196	IMG_1079.png	/www/wwwroot/risesocial-be/uploads/images/1757939468056-IMG_1079.png	6609474	image/png	2025-09-15 12:31:12.21	PAYMENT_PROOF
197	1060.PNG	/www/wwwroot/risesocial-be/uploads/images/1757970698651-1060.PNG	479257	image/png	2025-09-15 21:11:38.801	HEADSHOT
198	inbound6657161015076811291.jpg	/www/wwwroot/risesocial-be/uploads/images/1757987585972-inbound6657161015076811291.jpg	81228	image/jpeg	2025-09-16 01:53:06.041	HEADSHOT
199	f4e792fd-7fb0-45e0-882c-8a6741895683.png	/www/wwwroot/risesocial-be/uploads/images/1757993803182-f4e792fd-7fb0-45e0-882c-8a6741895683.png	1488713	image/png	2025-09-16 03:36:44.011	HEADSHOT
200	Special Invitation.png	/www/wwwroot/risesocial-be/uploads/images/1757996247090-Special Invitation.png	836929	image/png	2025-09-16 04:17:27.358	PAYMENT_PROOF
201	Carolina.jpeg	/www/wwwroot/risesocial-be/uploads/images/1758047901823-Carolina.jpeg	14890	image/jpeg	2025-09-16 18:38:21.838	HEADSHOT
202	InShot_20250831_165253389.jpg	/www/wwwroot/risesocial-be/uploads/images/1758080630109-InShot_20250831_165253389.jpg	328139	image/jpeg	2025-09-17 03:43:50.129	HEADSHOT
203	1726932538241.jpeg	/www/wwwroot/risesocial-be/uploads/images/1758085905036-1726932538241.jpeg	112360	image/jpeg	2025-09-17 05:11:45.089	HEADSHOT
204	Demian Obialor Photo.jpg	/www/wwwroot/risesocial-be/uploads/images/1758234310610-Demian Obialor Photo.jpg	1332219	image/jpeg	2025-09-18 22:25:11.005	HEADSHOT
205	Pas Photo.jpeg	/www/wwwroot/risesocial-be/uploads/images/1758281375566-Pas Photo.jpeg	88905	image/jpeg	2025-09-19 11:29:35.585	HEADSHOT
206	PayPal_ Transaction Details.pdf	/www/wwwroot/risesocial-be/uploads/documents/1758295380738-PayPal_ Transaction Details.pdf	112733	application/pdf	2025-09-19 15:23:00.785	PAYMENT_PROOF
207	PayPal_ Transaction Details.pdf	/www/wwwroot/risesocial-be/uploads/documents/1758298515554-PayPal_ Transaction Details.pdf	112733	application/pdf	2025-09-19 16:15:15.606	PAYMENT_PROOF
208	Screenshot_20250919-112244.png	/www/wwwroot/risesocial-be/uploads/images/1758298974814-Screenshot_20250919-112244.png	16137	image/png	2025-09-19 16:22:54.82	PAYMENT_PROOF
209	PayPal_ Transaction Details.pdf	/www/wwwroot/risesocial-be/uploads/documents/1758304221669-PayPal_ Transaction Details.pdf	112733	application/pdf	2025-09-19 17:50:21.727	PAYMENT_PROOF
210	inbound7868789313603534676.jpg	/www/wwwroot/risesocial-be/uploads/images/1758308961524-inbound7868789313603534676.jpg	310988	image/jpeg	2025-09-19 19:09:21.56	HEADSHOT
211	31.png	/www/wwwroot/risesocial-be/uploads/images/1758359359112-31.png	1529288	image/png	2025-09-20 09:09:19.804	HEADSHOT
212	Snapchat-1593746838.jpg	/www/wwwroot/risesocial-be/uploads/images/1758365042270-Snapchat-1593746838.jpg	64717	image/jpeg	2025-09-20 10:44:02.286	HEADSHOT
213	Photo.pdf	/www/wwwroot/risesocial-be/uploads/documents/1758414191193-Photo.pdf	575601	application/pdf	2025-09-21 00:23:11.354	PAYMENT_PROOF
214	camphoto_684387517.jpeg	/www/wwwroot/risesocial-be/uploads/images/1758437946210-camphoto_684387517.jpeg	2543610	image/jpeg	2025-09-21 06:59:07.189	HEADSHOT
215	payment.png	/www/wwwroot/risesocial-be/uploads/images/1758475213761-payment.png	20151	image/png	2025-09-21 17:20:13.952	PAYMENT_PROOF
216	Payment.pdf	/www/wwwroot/risesocial-be/uploads/documents/1758475380895-Payment.pdf	108868	application/pdf	2025-09-21 17:23:00.951	PAYMENT_PROOF
217	IMG_4848.jpeg	/www/wwwroot/risesocial-be/uploads/images/1758517132852-IMG_4848.jpeg	744613	image/jpeg	2025-09-22 04:58:53.019	HEADSHOT
218	1000223621.jpg	/www/wwwroot/risesocial-be/uploads/images/1758522784839-1000223621.jpg	458135	image/jpeg	2025-09-22 06:33:04.856	HEADSHOT
219	IMG_1401.png	/www/wwwroot/risesocial-be/uploads/images/1758529789752-IMG_1401.png	228088	image/png	2025-09-22 08:29:49.759	PAYMENT_PROOF
220	IMG_20250407_110752.jpg	/www/wwwroot/risesocial-be/uploads/images/1758571455006-IMG_20250407_110752.jpg	1452988	image/jpeg	2025-09-22 20:04:15.437	HEADSHOT
221	foto.png	/www/wwwroot/risesocial-be/uploads/images/1758586450359-foto.png	475673	image/png	2025-09-23 00:14:10.388	HEADSHOT
222	fe9bf8df-c8a1-497e-b642-d3db32533be3.jpg	/www/wwwroot/risesocial-be/uploads/images/1758593566454-fe9bf8df-c8a1-497e-b642-d3db32533be3.jpg	171686	image/jpeg	2025-09-23 02:12:46.509	PAYMENT_PROOF
223	Truc Lam Dao - Proof of Payment.pdf	/www/wwwroot/risesocial-be/uploads/documents/1758593699800-Truc Lam Dao - Proof of Payment.pdf	335412	application/pdf	2025-09-23 02:14:59.813	PAYMENT_PROOF
224	gamerz_id.png	/www/wwwroot/risesocial-be/uploads/images/1758598566749-gamerz_id.png	40058	image/png	2025-09-23 03:36:06.753	PAYMENT_PROOF
225	gamerz_id.png	/www/wwwroot/risesocial-be/uploads/images/1758598661792-gamerz_id.png	40058	image/png	2025-09-23 03:37:41.795	PAYMENT_PROOF
226	gamerz_id.png	/www/wwwroot/risesocial-be/uploads/images/1758598810979-gamerz_id.png	40058	image/png	2025-09-23 03:40:10.983	PAYMENT_PROOF
227	indosat.png	/www/wwwroot/risesocial-be/uploads/images/1758603316078-indosat.png	6086	image/png	2025-09-23 04:55:16.082	PAYMENT_PROOF
228	indosat.png	/www/wwwroot/risesocial-be/uploads/images/1758603322702-indosat.png	6086	image/png	2025-09-23 04:55:22.704	PAYMENT_PROOF
229	Cable_Lug_Design_Report.pdf	/www/wwwroot/risesocial-be/uploads/documents/1758612355422-Cable_Lug_Design_Report.pdf	1099287	application/pdf	2025-09-23 07:25:55.541	PAYMENT_PROOF
230	IMG_2430.jpeg	/www/wwwroot/risesocial-be/uploads/images/1758621845080-IMG_2430.jpeg	140466	image/jpeg	2025-09-23 10:04:05.085	PAYMENT_PROOF
231	Rise Social Japan Summit Receipt .pdf	/www/wwwroot/risesocial-be/uploads/documents/1758622194559-Rise Social Japan Summit Receipt .pdf	83036	application/pdf	2025-09-23 10:09:54.563	PAYMENT_PROOF
232	CONFIRMATION.jpeg	/www/wwwroot/risesocial-be/uploads/images/1758624396187-CONFIRMATION.jpeg	895410	image/jpeg	2025-09-23 10:46:36.212	HEADSHOT
233	Rival.png	/www/wwwroot/risesocial-be/uploads/images/1758627750126-Rival.png	586682	image/png	2025-09-23 11:42:30.189	PAYMENT_PROOF
234	Rival.png	/www/wwwroot/risesocial-be/uploads/images/1758629520428-Rival.png	586682	image/png	2025-09-23 12:12:00.527	PAYMENT_PROOF
235	Rival.png	/www/wwwroot/risesocial-be/uploads/images/1758631467561-Rival.png	586682	image/png	2025-09-23 12:44:27.663	PAYMENT_PROOF
236	Rival.png	/www/wwwroot/risesocial-be/uploads/images/1758633469533-Rival.png	586682	image/png	2025-09-23 13:17:49.544	PAYMENT_PROOF
237	Screenshot 2025-09-23 at 1.03.00 PM.png	/www/wwwroot/risesocial-be/uploads/images/1758657795121-Screenshot 2025-09-23 at 1.03.00 PM.png	2464878	image/png	2025-09-23 20:03:15.888	HEADSHOT
238	Rise Social Payment_Reil Abdelrahman.pdf	/www/wwwroot/risesocial-be/uploads/documents/1758667667829-Rise Social Payment_Reil Abdelrahman.pdf	319658	application/pdf	2025-09-23 22:47:47.898	PAYMENT_PROOF
239	bukti tf risesocial.jpg	/www/wwwroot/risesocial-be/uploads/images/1758675779052-bukti tf risesocial.jpg	39711	image/jpeg	2025-09-24 01:02:59.057	PAYMENT_PROOF
240	WhatsApp Image 2025-01-02 at 09.26.28.jpeg	/www/wwwroot/risesocial-be/uploads/images/1758686977902-WhatsApp Image 2025-01-02 at 09.26.28.jpeg	812782	image/jpeg	2025-09-24 04:09:37.929	HEADSHOT
241	550722043_122153017796794276_8039702844392925602_n.jpg	/www/wwwroot/risesocial-be/uploads/images/1758688859180-550722043_122153017796794276_8039702844392925602_n.jpg	124950	image/jpeg	2025-09-24 04:40:59.229	HEADSHOT
242	550722043_122153017796794276_8039702844392925602_n.jpg	/www/wwwroot/risesocial-be/uploads/images/1758688873659-550722043_122153017796794276_8039702844392925602_n.jpg	124950	image/jpeg	2025-09-24 04:41:13.703	HEADSHOT
243	IMG_0324.jpeg	/www/wwwroot/risesocial-be/uploads/images/1758689539966-IMG_0324.jpeg	60333	image/jpeg	2025-09-24 04:52:19.968	HEADSHOT
244	IMG_0225.png	/www/wwwroot/risesocial-be/uploads/images/1758689663903-IMG_0225.png	677213	image/png	2025-09-24 04:54:23.922	HEADSHOT
245	Facetune_24-09-2025-01-53-26.jpeg	/www/wwwroot/risesocial-be/uploads/images/1758691587257-Facetune_24-09-2025-01-53-26.jpeg	4001388	image/jpeg	2025-09-24 05:26:28.189	HEADSHOT
246	9C7A2521 copie.jpg	/www/wwwroot/risesocial-be/uploads/images/1758702983113-9C7A2521 copie.jpg	7739015	image/jpeg	2025-09-24 08:36:24.665	HEADSHOT
247	IMG_1885.png	/www/wwwroot/risesocial-be/uploads/images/1758703305546-IMG_1885.png	560439	image/png	2025-09-24 08:41:45.55	HEADSHOT
248	inbound1306947443280306623.jpg	/www/wwwroot/risesocial-be/uploads/images/1758706226341-inbound1306947443280306623.jpg	724382	image/jpeg	2025-09-24 09:30:26.357	HEADSHOT
249	IMG-20241024-WA0008.jpg	/www/wwwroot/risesocial-be/uploads/images/1758709839563-IMG-20241024-WA0008.jpg	114026	image/jpeg	2025-09-24 10:30:39.606	HEADSHOT
250	IMG_1926.jpeg	/www/wwwroot/risesocial-be/uploads/images/1758735424753-IMG_1926.jpeg	921770	image/jpeg	2025-09-24 17:37:05.015	PAYMENT_PROOF
251	inbound2570003449811571255.jpg	/www/wwwroot/risesocial-be/uploads/images/1758742357538-inbound2570003449811571255.jpg	62303	image/jpeg	2025-09-24 19:32:37.546	HEADSHOT
252	image.jpg	/www/wwwroot/risesocial-be/uploads/images/1758750156042-image.jpg	3294382	image/jpeg	2025-09-24 21:42:36.239	PAYMENT_PROOF
253	1000167897.jpg	/www/wwwroot/risesocial-be/uploads/images/1758750268112-1000167897.jpg	112371	image/jpeg	2025-09-24 21:44:28.176	HEADSHOT
254	1000133471.jpg	/www/wwwroot/risesocial-be/uploads/images/1758759095482-1000133471.jpg	2768088	image/jpeg	2025-09-25 00:11:35.944	HEADSHOT
255	inbound4171748842139531321.jpg	/www/wwwroot/risesocial-be/uploads/images/1758767047473-inbound4171748842139531321.jpg	783439	image/jpeg	2025-09-25 02:24:07.483	HEADSHOT
256	IMG-20250806-WA0005.jpg	/www/wwwroot/risesocial-be/uploads/images/1758767527398-IMG-20250806-WA0005.jpg	356288	image/jpeg	2025-09-25 02:32:07.421	HEADSHOT
257	Elective Course-Schedule _Poster-06.png	/www/wwwroot/risesocial-be/uploads/images/1758770689606-Elective Course-Schedule _Poster-06.png	1828400	image/png	2025-09-25 03:24:49.633	HEADSHOT
258	PayPal_ Transaction Details.pdf	/www/wwwroot/risesocial-be/uploads/documents/1758771798913-PayPal_ Transaction Details.pdf	77653	application/pdf	2025-09-25 03:43:18.92	PAYMENT_PROOF
259	Applicants process.pdf	/www/wwwroot/risesocial-be/uploads/documents/1758772650536-Applicants process.pdf	42828	application/pdf	2025-09-25 03:57:30.544	PAYMENT_PROOF
260	DSC06787.jpg	/www/wwwroot/risesocial-be/uploads/images/1758772755694-DSC06787.jpg	1823983	image/jpeg	2025-09-25 03:59:15.72	HEADSHOT
261	inbound9024881551478762431.jpg	/www/wwwroot/risesocial-be/uploads/images/1758775572894-inbound9024881551478762431.jpg	66276	image/jpeg	2025-09-25 04:46:12.901	HEADSHOT
262	IMG_1453.jpeg	/www/wwwroot/risesocial-be/uploads/images/1758779149323-IMG_1453.jpeg	12051	image/jpeg	2025-09-25 05:45:49.355	PAYMENT_PROOF
263	KKY_1107.JPG	/www/wwwroot/risesocial-be/uploads/images/1758787136436-KKY_1107.JPG	7530167	image/jpeg	2025-09-25 07:58:56.997	HEADSHOT
264	PayPal_ Transaction Details.PDF	/www/wwwroot/risesocial-be/uploads/documents/1758815550794-PayPal_ Transaction Details.PDF	14257	application/pdf	2025-09-25 15:52:30.855	PAYMENT_PROOF
265	1000559460.jpg	/www/wwwroot/risesocial-be/uploads/images/1758820850034-1000559460.jpg	132394	image/jpeg	2025-09-25 17:20:50.082	HEADSHOT
266	PayPal_ Paola Perales.pdf	/www/wwwroot/risesocial-be/uploads/documents/1758856008993-PayPal_ Paola Perales.pdf	103463	application/pdf	2025-09-26 03:06:49.093	PAYMENT_PROOF
267	IMG_2354.png	/www/wwwroot/risesocial-be/uploads/images/1758868291797-IMG_2354.png	131252	image/png	2025-09-26 06:31:31.866	PAYMENT_PROOF
268	IMG_2355.png	/www/wwwroot/risesocial-be/uploads/images/1758868310646-IMG_2355.png	140343	image/png	2025-09-26 06:31:50.662	PAYMENT_PROOF
269	IMG_2355.png	/www/wwwroot/risesocial-be/uploads/images/1758872313276-IMG_2355.png	140343	image/png	2025-09-26 07:38:33.285	PAYMENT_PROOF
270	Gemini_Generated_Image_itgzd2itgzd2itgz.png	/www/wwwroot/risesocial-be/uploads/images/1758878430072-Gemini_Generated_Image_itgzd2itgzd2itgz.png	1410369	image/png	2025-09-26 09:20:30.434	PAYMENT_PROOF
271	Bukti Bayar Ahadin Syarifudin Fahmi, SKM, M.KKK.pdf	/www/wwwroot/risesocial-be/uploads/documents/1758890422352-Bukti Bayar Ahadin Syarifudin Fahmi, SKM, M.KKK.pdf	96049	application/pdf	2025-09-26 12:40:22.358	PAYMENT_PROOF
272	IMG-20250926-WA0015.jpg	/www/wwwroot/risesocial-be/uploads/images/1758893698684-IMG-20250926-WA0015.jpg	413889	image/jpeg	2025-09-26 13:34:58.689	PAYMENT_PROOF
273	بورتو السخنه.png.png	/www/wwwroot/risesocial-be/uploads/images/1758918122033-بورتو السخنه.png.png	3653546	image/png	2025-09-26 20:22:03.092	HEADSHOT
274	D27395EC-6B1E-4C87-9FB5-AF968CD7015C.jpeg	/www/wwwroot/risesocial-be/uploads/images/1758918145407-D27395EC-6B1E-4C87-9FB5-AF968CD7015C.jpeg	1222023	image/jpeg	2025-09-26 20:22:25.415	HEADSHOT
275	1000046507.jpg	/www/wwwroot/risesocial-be/uploads/images/1758926226801-1000046507.jpg	84595	image/jpeg	2025-09-26 22:37:06.809	HEADSHOT
276	HUBA.jpg	/www/wwwroot/risesocial-be/uploads/images/1758957515656-HUBA.jpg	97840	image/jpeg	2025-09-27 07:18:35.708	HEADSHOT
277	IMG_0501.jpeg	/www/wwwroot/risesocial-be/uploads/images/1758959798043-IMG_0501.jpeg	621870	image/jpeg	2025-09-27 07:56:38.051	HEADSHOT
278	IMG_1378.png	/www/wwwroot/risesocial-be/uploads/images/1758968337636-IMG_1378.png	213681	image/png	2025-09-27 10:18:57.644	PAYMENT_PROOF
279	PayPal_ Aktivitas.pdf	/www/wwwroot/risesocial-be/uploads/documents/1758972333975-PayPal_ Aktivitas.pdf	83231	application/pdf	2025-09-27 11:25:33.982	PAYMENT_PROOF
280	FA0A55B7-0CAF-4501-8D3E-9A5B49627AAE.jpeg	/www/wwwroot/risesocial-be/uploads/images/1758975754641-FA0A55B7-0CAF-4501-8D3E-9A5B49627AAE.jpeg	1555732	image/jpeg	2025-09-27 12:22:34.658	HEADSHOT
281	inbound5585623479056923166.jpg	/www/wwwroot/risesocial-be/uploads/images/1758976000964-inbound5585623479056923166.jpg	508720	image/jpeg	2025-09-27 12:26:40.982	HEADSHOT
282	ABF53495-788C-4189-94F2-B87BB4531940.png	/www/wwwroot/risesocial-be/uploads/images/1758983346885-ABF53495-788C-4189-94F2-B87BB4531940.png	409844	image/png	2025-09-27 14:29:06.891	PAYMENT_PROOF
283	16093FE9-3C5C-479E-B5C4-18CA70CF4E6B.png	/www/wwwroot/risesocial-be/uploads/images/1758983442162-16093FE9-3C5C-479E-B5C4-18CA70CF4E6B.png	359831	image/png	2025-09-27 14:30:42.166	PAYMENT_PROOF
284	PayPal- Transaction Details.pdf	/www/wwwroot/risesocial-be/uploads/documents/1758983699135-PayPal- Transaction Details.pdf	58862	application/pdf	2025-09-27 14:34:59.143	PAYMENT_PROOF
285	PayPal_ Aktivitas.pdf	/www/wwwroot/risesocial-be/uploads/documents/1758987540228-PayPal_ Aktivitas.pdf	83231	application/pdf	2025-09-27 15:39:00.243	PAYMENT_PROOF
286	IMG_20250917_172753.jpg	/www/wwwroot/risesocial-be/uploads/images/1759009637964-IMG_20250917_172753.jpg	1085070	image/jpeg	2025-09-27 21:47:18.127	PAYMENT_PROOF
287	PayPal_ Aktivitas.pdf	/www/wwwroot/risesocial-be/uploads/documents/1759029433049-PayPal_ Aktivitas.pdf	83231	application/pdf	2025-09-28 03:17:13.061	PAYMENT_PROOF
288	f623b643-4756-4b26-b12f-5775fd752c8f.jpg	/www/wwwroot/risesocial-be/uploads/images/1759038128796-f623b643-4756-4b26-b12f-5775fd752c8f.jpg	115062	image/jpeg	2025-09-28 05:42:08.848	PAYMENT_PROOF
289	PHOTO MD SAFAET HOSSAIN_15 July 2025.jpg	/www/wwwroot/risesocial-be/uploads/images/1759069233572-PHOTO MD SAFAET HOSSAIN_15 July 2025.jpg	102832	image/jpeg	2025-09-28 14:20:33.62	HEADSHOT
290	IMG_7194.png	/www/wwwroot/risesocial-be/uploads/images/1759075171050-IMG_7194.png	266480	image/png	2025-09-28 15:59:31.104	PAYMENT_PROOF
291	IMG_1768.jpeg	/www/wwwroot/risesocial-be/uploads/images/1759085549338-IMG_1768.jpeg	80580	image/jpeg	2025-09-28 18:52:29.35	HEADSHOT
292	IMG_1799.png	/www/wwwroot/risesocial-be/uploads/images/1759088452237-IMG_1799.png	1378326	image/png	2025-09-28 19:40:52.543	PAYMENT_PROOF
293	IMG_4955.jpeg	/www/wwwroot/risesocial-be/uploads/images/1759114635977-IMG_4955.jpeg	2108347	image/jpeg	2025-09-29 02:57:16.206	HEADSHOT
294	3X4=1 4X6=1.jpg	/www/wwwroot/risesocial-be/uploads/images/1759123349211-3X4=1 4X6=1.jpg	1198559	image/jpeg	2025-09-29 05:22:29.45	HEADSHOT
295	IMG_0287.jpeg	/www/wwwroot/risesocial-be/uploads/images/1759123580805-IMG_0287.jpeg	1651663	image/jpeg	2025-09-29 05:26:21.105	PAYMENT_PROOF
296	Hw1DEJ2ZZ41758378560.png	/www/wwwroot/risesocial-be/uploads/images/1759141070392-Hw1DEJ2ZZ41758378560.png	124036	image/png	2025-09-29 10:17:50.449	PAYMENT_PROOF
297	Preseason_course syllabus_.pdf	/www/wwwroot/risesocial-be/uploads/documents/1759145220787-Preseason_course syllabus_.pdf	54534	application/pdf	2025-09-29 11:27:00.796	PAYMENT_PROOF
298	3,5x4,5 g.jpg	/www/wwwroot/risesocial-be/uploads/images/1759154800215-3,5x4,5 g.jpg	332137	image/jpeg	2025-09-29 14:06:40.246	HEADSHOT
299	bukti tf.pdf	/www/wwwroot/risesocial-be/uploads/documents/1759160346964-bukti tf.pdf	203280	application/pdf	2025-09-29 15:39:06.982	PAYMENT_PROOF
300	nga4.jpg	/www/wwwroot/risesocial-be/uploads/images/1759162013140-nga4.jpg	425052	image/jpeg	2025-09-29 16:06:53.173	HEADSHOT
301	IMAGE 2025-09-29 21:08:15.jpg	/www/wwwroot/risesocial-be/uploads/images/1759162097498-IMAGE 2025-09-29 21:08:15.jpg	51802	image/jpeg	2025-09-29 16:08:17.508	PAYMENT_PROOF
302	IMG_1884.PNG	/www/wwwroot/risesocial-be/uploads/images/1759168744315-IMG_1884.PNG	363083	image/png	2025-09-29 17:59:04.386	PAYMENT_PROOF
303	Tasbia_Uddin_Resume.pdf	/www/wwwroot/risesocial-be/uploads/documents/1759175502665-Tasbia_Uddin_Resume.pdf	4137	application/pdf	2025-09-29 19:51:42.673	PAYMENT_PROOF
304	1000196086.jpg	/www/wwwroot/risesocial-be/uploads/images/1759186878432-1000196086.jpg	499862	image/jpeg	2025-09-29 23:01:18.455	HEADSHOT
305	Proof of Payment - Valaysia Smith.pdf	/www/wwwroot/risesocial-be/uploads/documents/1759197387183-Proof of Payment - Valaysia Smith.pdf	98697	application/pdf	2025-09-30 01:56:27.229	PAYMENT_PROOF
306	IMG-20250929-WA0048.jpg	/www/wwwroot/risesocial-be/uploads/images/1759197566660-IMG-20250929-WA0048.jpg	123348	image/jpeg	2025-09-30 01:59:26.707	PAYMENT_PROOF
307	Payment Ángel Sebastián RISE SOCIAL FULLY FOUNDED.pdf	/www/wwwroot/risesocial-be/uploads/documents/1759197799157-Payment Ángel Sebastián RISE SOCIAL FULLY FOUNDED.pdf	265519	application/pdf	2025-09-30 02:03:19.162	PAYMENT_PROOF
308	Rise Payment Prove.jpg	/www/wwwroot/risesocial-be/uploads/images/1759212030984-Rise Payment Prove.jpg	39711	image/jpeg	2025-09-30 06:00:30.989	PAYMENT_PROOF
309	Vonley W. Smith_RYL Summit Japan 2025_PayPal_Transaction Details_9.30.2025.pdf	/www/wwwroot/risesocial-be/uploads/documents/1759218680106-Vonley W. Smith_RYL Summit Japan 2025_PayPal_Transaction Details_9.30.2025.pdf	106940	application/pdf	2025-09-30 07:51:20.149	PAYMENT_PROOF
310	Vonley W. Smith_RYL Summit Japan 2025_PayPal_Transaction Details_9.30.2025.pdf	/www/wwwroot/risesocial-be/uploads/documents/1759221260260-Vonley W. Smith_RYL Summit Japan 2025_PayPal_Transaction Details_9.30.2025.pdf	106940	application/pdf	2025-09-30 08:34:20.303	PAYMENT_PROOF
311	Gemini_Generated_Image_tr2rmtr2rmtr2rmt.png	/www/wwwroot/risesocial-be/uploads/images/1759221790143-Gemini_Generated_Image_tr2rmtr2rmtr2rmt.png	1380776	image/png	2025-09-30 08:43:10.157	HEADSHOT
312	sched.png	/www/wwwroot/risesocial-be/uploads/images/1759225015803-sched.png	475477	image/png	2025-09-30 09:36:55.85	HEADSHOT
313	Payment Receipt.pdf	/www/wwwroot/risesocial-be/uploads/documents/1759225020986-Payment Receipt.pdf	105276	application/pdf	2025-09-30 09:37:01.037	PAYMENT_PROOF
314	Payment Receipt.pdf	/www/wwwroot/risesocial-be/uploads/documents/1759225044691-Payment Receipt.pdf	105276	application/pdf	2025-09-30 09:37:24.734	PAYMENT_PROOF
315	Payment Receipt.pdf	/www/wwwroot/risesocial-be/uploads/documents/1759225909506-Payment Receipt.pdf	170292	application/pdf	2025-09-30 09:51:49.556	PAYMENT_PROOF
316	viky zahra nabilah.PNG	/www/wwwroot/risesocial-be/uploads/images/1759235461070-viky zahra nabilah.PNG	243847	image/png	2025-09-30 12:31:01.118	PAYMENT_PROOF
317	Gambar WhatsApp 2025-08-29 pukul 11.48.32_bc243cd1.jpg	/www/wwwroot/risesocial-be/uploads/images/1759236049779-Gambar WhatsApp 2025-08-29 pukul 11.48.32_bc243cd1.jpg	57610	image/jpeg	2025-09-30 12:40:49.783	PAYMENT_PROOF
318	Nabilah Aisyah Masbuchin_Indonesia.jpg	/www/wwwroot/risesocial-be/uploads/images/1759236097200-Nabilah Aisyah Masbuchin_Indonesia.jpg	57610	image/jpeg	2025-09-30 12:41:37.205	PAYMENT_PROOF
319	Screenshot 2025-06-10 105342.png	/www/wwwroot/risesocial-be/uploads/images/1759236480957-Screenshot 2025-06-10 105342.png	392953	image/png	2025-09-30 12:48:00.962	PAYMENT_PROOF
320	Make logo.JPG	/www/wwwroot/risesocial-be/uploads/images/1759236958011-Make logo.JPG	19505	image/jpeg	2025-09-30 12:55:58.016	HEADSHOT
321	Minh Anh Nguyen_Registration fee.png	/www/wwwroot/risesocial-be/uploads/images/1759238173384-Minh Anh Nguyen_Registration fee.png	84714	image/png	2025-09-30 13:16:13.398	PAYMENT_PROOF
322	inbound7023109218450521814.jpg	/www/wwwroot/risesocial-be/uploads/images/1759239808912-inbound7023109218450521814.jpg	1379740	image/jpeg	2025-09-30 13:43:28.929	HEADSHOT
323	Screenshot 2025-01-26 224016.png	/www/wwwroot/risesocial-be/uploads/images/1759240654620-Screenshot 2025-01-26 224016.png	302633	image/png	2025-09-30 13:57:34.626	PAYMENT_PROOF
324	PayPal_ Transaction Details.pdf	/www/wwwroot/risesocial-be/uploads/documents/1759242257262-PayPal_ Transaction Details.pdf	107981	application/pdf	2025-09-30 14:24:17.307	PAYMENT_PROOF
325	Nguyen Thuy Duong_Payment receipt.png	/www/wwwroot/risesocial-be/uploads/images/1759243419678-Nguyen Thuy Duong_Payment receipt.png	43788	image/png	2025-09-30 14:43:39.697	PAYMENT_PROOF
326	Receipt_Zarina Rafgatova.png	/www/wwwroot/risesocial-be/uploads/images/1759244428924-Receipt_Zarina Rafgatova.png	54402	image/png	2025-09-30 15:00:28.927	PAYMENT_PROOF
327	PayPal_ Transaction Details.pdf	/www/wwwroot/risesocial-be/uploads/documents/1759246827247-PayPal_ Transaction Details.pdf	104597	application/pdf	2025-09-30 15:40:27.303	PAYMENT_PROOF
328	Genta Nakano 1.jpg	/Users/umarsani/Projects/rise-social/backend/uploads/images/1772220698615-Genta Nakano 1.jpg	270495	image/jpeg	2026-02-27 19:31:38.654	PAYMENT_PROOF
\.


--
-- Data for Name: job_ai_insights; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_ai_insights (id, job_id, ai_salary_currency, ai_salary_value, ai_salary_min_value, ai_salary_max_value, ai_salary_unit_text, ai_benefits, ai_experience_level, ai_work_arrangement, ai_work_arrangement_days, ai_remote_location, ai_remote_location_derived, ai_key_skills, ai_core_responsibilities, ai_requirements_summary, ai_working_hours, ai_job_language, ai_visa_sponsorship, ai_hiring_manager_name, ai_hiring_manager_email, salary_confidence, skills_confidence, requirements_confidence, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: job_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_applications (id, job_id, user_id, status, cover_letter, resume_url, applied_at, updated_at, notes) FROM stdin;
\.


--
-- Data for Name: job_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_locations (id, city, region, country, timezone, latitude, longitude, raw_location_data, location_type, is_remote, created_at) FROM stdin;
5	Kyiv	\N	Ukraine	Europe/Kiev	50.45003360	30.52413610	{"@type": "Place", "address": {"@type": "PostalAddress", "addressRegion": null, "streetAddress": null, "addressCountry": "UA", "addressLocality": "Kyiv"}, "latitude": 50.44975, "longitude": 30.523718}	\N	f	2025-09-29 19:18:43.872
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, title, slug, company_id, location_id, description, employment_type, seniority_level, status, direct_apply, external_url, posted_date, valid_until, source_type, source, source_domain, source_url, linkedin_job_id, recruiter_name, recruiter_title, recruiter_url, salary_raw, location_requirements_raw, meta_title, meta_description, api_created_at, created_at, updated_at) FROM stdin;
26	ESG Lead	esg-lead	21	5	Position: ESG Lead\nLocation: Kyiv, Ukraine\nWork format: Full-time / Employment Agreement\n\nWe have a great career opportunity for an ESG Lead in a Ukrainian renewable energy company with a head office in Kyiv.\n\nWith the primary focus on providing dependable clean energy from sustainable renewable sources, our Partner’s team operates from the offices in Kyiv and London, and its expertise spans the management of solar and wind power plants, as well as development and construction of renewable energy projects, in addition to the robust commercial sales of renewable energy on the electricity market. Currently, the total Company’s capacity of the solar and wind projects in its ownership and operation is 636 MW, and expanding its presence in the Ukrainian market. Committed to supporting a "green" rebuilding, our Partner actively develops over 400 MW of wind & storage projects and aims to expand to other renewable energy technologies. As strong advocates for a low-carbon and sustainable future, the company strives to make a lasting positive impact on the environment and communities.\n\nTo support the Company’s active growth, we are looking for an experienced specialist who will be responsible for leading the Company's ESG strategy development and implementation. This includes staying up-to-date on relevant regulations and standards, collaborating with stakeholders, conducting audits, managing environmental permits and certifications (including ISO Certification), overseeing pollution control and waste management, interacting with regulatory bodies, managing environmental contractors, and reporting on ESG performance. The role also involves training, ESG budget management, and involvement in sustainability and non-financial reporting.\n\nMain Responsibilities:\nESG Strategy development and implementation. Monitor and report on progress toward achieving ESG and Environmental targets and Key Performance Indicators (KPIs)\nESG budgeting based on the ESG strategy and ESG KPIs\nLeading - in accordance with Company's IMS system - implementation, updating, reviewing and auditing of corporate ESG policies and procedures. Developing all documentation related to ESG topics, both regulated and on the project’s request\nCollaborate with stakeholders to ensure effective communication and alignment on ESG priorities\nLeading ESG audits in ISO Certification, IFC, EBRD requirements etc.\nLeading all aspects of pollution control, waste management and energy efficiency, incl. Company’s GHG emissions calculation and control\nInteracts with relevant bodies such state and local authorities, regulatory agencies, external auditors, prepares needed documentation, schedules required testing, and provides any necessary additional follow-up documentation\nCoordinates environmental service contractors, negotiates agreements and manages associated costs and revenues (incl. Waste, Environmental Impact Assessment (EIA), Post-project Environmental Monitoring and ESG Reporting)\nAssists other Company’s departments and units in their dealings with contractors in all environmental issues\nOrganizing and delivering training programs on ESG/Environmental topics for all Company members\nWrites environmental reports, contributes to Sustainability/ESG/ Non-Financial Report, GRI Report\n\nQualifications and professional experience:\nHigh school diploma (Degree in environmental science)\nProven experience in the relevant field (5+ years of experience)\nDeep knowledge of environmental regulations and ISO 14001:2015 standard\nKnowledge of international ESG frameworks\nFamiliar with IFC, EBRD requirements\nExperience of calculating carbon emissions using industry standards such as the GHG\nProficiency in sustainability reporting standards\nProven ability to work through other functions and personnel to deliver on ESG goals\nStrong written and verbal communication and presentation skills, ability to interact at an executive level\nUkrainian – Fluent, English – Intermediate and above\n\nWe offer:\nCompetitive salary and official employment with all social protection requirements\nOpportunity for career growth in an innovative renewable energy company with international investments\nCooperation in a friendly atmosphere with a great professional team that implements ambitious energy projects and helps the country become truly energy independent\nParticipation in corporate trainings and English language courses\nPerformance management system for all employees\nA good health insurance package that will be available after the probationary period (3 months)\nPhone package\nWorkplace in a modern and innovative office in Kyiv with hybrid working schedule\n\nIf you are interested in learning more details about this position, please send your CV to office@hrenergy.org with the topic "ESG Lead" and we will provide you with more detailed information about the opportunity.\nShow more Show less	FULL_TIME	Старший середній рівень	active	t	https://ua.linkedin.com/jobs/view/esg-lead-at-hr-energy-4302683884	2025-09-23 13:57:57	2025-10-23 13:57:57	jobboard	linkedin	ua.linkedin.com	https://ua.linkedin.com/jobs/view/esg-lead-at-hr-energy-4302683884	1876096057	\N	\N	\N	\N	\N	\N	\N	2025-09-29 19:18:43.891	2025-09-29 19:18:43.892	2025-09-29 19:18:43.892
\.


--
-- Data for Name: midtrans_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.midtrans_payments (id, order_id, snap_token, redirect_url, transaction_id, payment_type, gross_amount_idr, currency, transaction_status, fraud_status, payment_details, last_notification, notified_at, paid_at, created_at, updated_at) FROM stdin;
1	RYLS02RCNYVK	4506aa97-d240-4162-b4ec-de7942d1f919	https://app.midtrans.com/snap/v4/redirection/4506aa97-d240-4162-b4ec-de7942d1f919	\N	\N	243873	IDR	pending	\N	{}	{}	\N	\N	2025-08-13 01:50:25.901	2025-08-13 01:50:25.901
2	RYLS04WPWMLXSK	b62038a9-e762-49a7-a60b-8ad489e5adf8	https://app.midtrans.com/snap/v4/redirection/b62038a9-e762-49a7-a60b-8ad489e5adf8	\N	\N	1626	IDR	pending	\N	{}	{}	\N	\N	2025-08-13 01:53:19.799	2025-08-13 01:53:19.799
3	RYLS05WOUSN	0bdc8986-0f94-4665-93ef-5cd08af5e0fa	https://app.midtrans.com/snap/v4/redirection/0bdc8986-0f94-4665-93ef-5cd08af5e0fa	\N	\N	243540	IDR	pending	\N	{}	{}	\N	\N	2025-08-13 03:02:01.576	2025-08-13 03:02:01.576
4	RYLS06AJFVF	d42b0533-d812-46fb-9237-024fe72bd82c	https://app.midtrans.com/snap/v4/redirection/d42b0533-d812-46fb-9237-024fe72bd82c	\N	\N	242498	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 07:20:44.468	2025-08-15 07:20:44.468
5	RYLS07TGYBQ	67e94f63-e111-44a0-956f-6312fdce8765	https://app.midtrans.com/snap/v4/redirection/67e94f63-e111-44a0-956f-6312fdce8765	\N	\N	242600	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 13:13:55.095	2025-08-15 13:13:55.095
6	RYLS08MMJGN	d7ead93b-9489-48fa-be21-aed788c8abec	https://app.midtrans.com/snap/v4/redirection/d7ead93b-9489-48fa-be21-aed788c8abec	\N	\N	242608	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 13:18:17.566	2025-08-15 13:18:17.566
7	RYLS09JXAGKBI	2e606f89-a82a-4b84-b9f2-4d43c628b7fc	https://app.midtrans.com/snap/v4/redirection/2e606f89-a82a-4b84-b9f2-4d43c628b7fc	\N	\N	242623	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 13:47:13.762	2025-08-15 13:47:13.762
8	RYLS10MNLNMBFE	984954c7-eabf-4b05-84e5-44c84651714d	https://app.midtrans.com/snap/v4/redirection/984954c7-eabf-4b05-84e5-44c84651714d	\N	\N	242515	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 14:13:17.93	2025-08-15 14:13:17.93
9	RYLS11BQEVDS	2a284065-e731-4a14-b3d0-baf448a0723c	https://app.midtrans.com/snap/v4/redirection/2a284065-e731-4a14-b3d0-baf448a0723c	\N	\N	242550	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 14:18:17.136	2025-08-15 14:18:17.136
10	RYLS12VQWHOT	41ad7f02-af85-452a-9661-f8ff60a6f735	https://app.midtrans.com/snap/v4/redirection/41ad7f02-af85-452a-9661-f8ff60a6f735	\N	\N	242709	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 14:56:15.442	2025-08-15 14:56:15.442
11	RYLS13KGJA	74ff2679-26d9-4f81-ac91-b71fb8267da0	https://app.midtrans.com/snap/v4/redirection/74ff2679-26d9-4f81-ac91-b71fb8267da0	\N	\N	242704	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 15:00:14.226	2025-08-15 15:00:14.226
12	RYLS14UHGF	ee43d565-6999-4827-9afd-fcbf4038977e	https://app.midtrans.com/snap/v4/redirection/ee43d565-6999-4827-9afd-fcbf4038977e	\N	\N	242708	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 15:02:08.332	2025-08-15 15:02:08.332
13	RYLS15HHPTUTUB	21fb3768-3c1d-4c4b-8bf5-29062198a417	https://app.midtrans.com/snap/v4/redirection/21fb3768-3c1d-4c4b-8bf5-29062198a417	\N	\N	242719	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 15:14:51.19	2025-08-15 15:14:51.19
14	RYLS16WVQJXT	affea180-d5f7-4c40-a94c-de95f2bed2b2	https://app.midtrans.com/snap/v4/redirection/affea180-d5f7-4c40-a94c-de95f2bed2b2	\N	\N	242711	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 15:20:41.17	2025-08-15 15:20:41.17
15	RYLS17PCLZV	c11f4ebb-39bc-4f50-a78d-565b15a3a2a7	https://app.midtrans.com/snap/v4/redirection/c11f4ebb-39bc-4f50-a78d-565b15a3a2a7	\N	\N	242723	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 15:32:54.519	2025-08-15 15:32:54.519
16	RYLS18CUQXXZ	bc4461d3-e568-4e3c-9c6f-c37365d57478	https://app.midtrans.com/snap/v4/redirection/bc4461d3-e568-4e3c-9c6f-c37365d57478	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 16:54:41.825	2025-08-15 16:54:41.825
17	RYLS19RMSZQFK	c46282d7-bd85-4fe5-962b-0432e64e6692	https://app.midtrans.com/snap/v4/redirection/c46282d7-bd85-4fe5-962b-0432e64e6692	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 17:03:30.448	2025-08-15 17:03:30.448
18	RYLS20PSVXEH	d6e6ae2f-c901-498e-9853-b3b07da7ade9	https://app.midtrans.com/snap/v4/redirection/d6e6ae2f-c901-498e-9853-b3b07da7ade9	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 17:07:13.234	2025-08-15 17:07:13.234
19	RYLS21IECAZUK	966ee594-7b15-4f04-8f5d-8b8cd4321bc1	https://app.midtrans.com/snap/v4/redirection/966ee594-7b15-4f04-8f5d-8b8cd4321bc1	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 17:52:19.836	2025-08-15 17:52:19.836
20	RYLS22GLSDBL	3ef9b642-85ef-4a6a-90df-200a72f5e7bd	https://app.midtrans.com/snap/v4/redirection/3ef9b642-85ef-4a6a-90df-200a72f5e7bd	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 17:56:54.212	2025-08-15 17:56:54.212
21	RYLS24YIWCKO	d0bd7ea6-389f-459b-a916-e0d8db6b0f1a	https://app.midtrans.com/snap/v4/redirection/d0bd7ea6-389f-459b-a916-e0d8db6b0f1a	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-15 22:05:59.588	2025-08-15 22:05:59.588
22	RYLS25CUAOK	b095597d-38d1-47c1-8f94-d62e08d0a471	https://app.midtrans.com/snap/v4/redirection/b095597d-38d1-47c1-8f94-d62e08d0a471	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 03:33:06.891	2025-08-16 03:33:06.891
23	RYLS26GLIZHG	94d31b24-7da0-4e4c-8dc3-8f5e41fa5b61	https://app.midtrans.com/snap/v4/redirection/94d31b24-7da0-4e4c-8dc3-8f5e41fa5b61	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 06:05:30.459	2025-08-16 06:05:30.459
24	RYLS27CN	05680dc4-a21c-4039-828f-028b29985ec9	https://app.midtrans.com/snap/v4/redirection/05680dc4-a21c-4039-828f-028b29985ec9	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 06:16:32.76	2025-08-16 06:16:32.76
25	RYLS29UWIOKQ	8561b41d-abcc-4a8a-b8aa-a992516ae608	https://app.midtrans.com/snap/v4/redirection/8561b41d-abcc-4a8a-b8aa-a992516ae608	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 08:47:17.028	2025-08-16 08:47:17.028
26	RYLS30LVQNMG	4907cfd5-07f7-4a38-98f5-d89870e8dfcf	https://app.midtrans.com/snap/v4/redirection/4907cfd5-07f7-4a38-98f5-d89870e8dfcf	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 08:56:09.827	2025-08-16 08:56:09.827
27	RYLS31AGCY	e3296165-e9a1-4d3b-83d2-9b0fa35c9481	https://app.midtrans.com/snap/v4/redirection/e3296165-e9a1-4d3b-83d2-9b0fa35c9481	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 09:08:28.02	2025-08-16 09:08:28.02
28	RYLS32JPHDRC	d1da45d0-03c5-4003-84ce-20db01844b0d	https://app.midtrans.com/snap/v4/redirection/d1da45d0-03c5-4003-84ce-20db01844b0d	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 09:37:33.306	2025-08-16 09:37:33.306
29	RYLS33PMSOLM	7b0f9447-aa6b-4ea4-a6a7-11130127ee33	https://app.midtrans.com/snap/v4/redirection/7b0f9447-aa6b-4ea4-a6a7-11130127ee33	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 12:35:06.172	2025-08-16 12:35:06.172
30	RYLS34CGXI	05835b45-9df5-4076-8d3a-7378af6e4270	https://app.midtrans.com/snap/v4/redirection/05835b45-9df5-4076-8d3a-7378af6e4270	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 12:55:39.587	2025-08-16 12:55:39.587
31	RYLS35OELQIVM	dcf98852-e888-4443-b19e-9b41c16ca840	https://app.midtrans.com/snap/v4/redirection/dcf98852-e888-4443-b19e-9b41c16ca840	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 13:17:06.939	2025-08-16 13:17:06.939
32	RYLS36TBDGU	e754f9aa-24b3-42ce-87f0-20dcff9c89bb	https://app.midtrans.com/snap/v4/redirection/e754f9aa-24b3-42ce-87f0-20dcff9c89bb	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 14:46:12.058	2025-08-16 14:46:12.058
33	RYLS37RNCWAB	85d7c98e-c0ca-45d3-b90f-1d1e96c5ec22	https://app.midtrans.com/snap/v4/redirection/85d7c98e-c0ca-45d3-b90f-1d1e96c5ec22	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 15:10:54.47	2025-08-16 15:10:54.47
34	RYLS38RWACAY	460c524e-3b59-48af-ba3c-829590858721	https://app.midtrans.com/snap/v4/redirection/460c524e-3b59-48af-ba3c-829590858721	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 16:09:09.85	2025-08-16 16:09:09.85
35	RYLS39AWFZEB	0155fe5c-44a6-48cf-8b9c-9cc61baa8957	https://app.midtrans.com/snap/v4/redirection/0155fe5c-44a6-48cf-8b9c-9cc61baa8957	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 16:38:22.66	2025-08-16 16:38:22.66
36	RYLS40WTPLS	395f9589-066c-4e6f-94d6-b3e2537c6929	https://app.midtrans.com/snap/v4/redirection/395f9589-066c-4e6f-94d6-b3e2537c6929	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 22:46:34.403	2025-08-16 22:46:34.403
37	RYLS41OQAL	874838dc-f967-485e-8224-81114dad7071	https://app.midtrans.com/snap/v4/redirection/874838dc-f967-485e-8224-81114dad7071	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 22:54:52.018	2025-08-16 22:54:52.018
38	RYLS42YLWXNHNO	cea5de3a-5abb-414e-b349-0e280149e012	https://app.midtrans.com/snap/v4/redirection/cea5de3a-5abb-414e-b349-0e280149e012	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 22:57:51.23	2025-08-16 22:57:51.23
39	RYLS43ZHXCHUC	5a26ff1d-3eaf-402c-a4a1-0fecd3067313	https://app.midtrans.com/snap/v4/redirection/5a26ff1d-3eaf-402c-a4a1-0fecd3067313	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 22:58:20.089	2025-08-16 22:58:20.089
40	RYLS44HGPQLP	2209484f-1495-4ba6-b4fe-9433a09eca65	https://app.midtrans.com/snap/v4/redirection/2209484f-1495-4ba6-b4fe-9433a09eca65	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 23:11:05.897	2025-08-16 23:11:05.897
41	RYLS45HKQVEJ	5644cd46-e0f3-4b96-8ef2-625e7f8f68e3	https://app.midtrans.com/snap/v4/redirection/5644cd46-e0f3-4b96-8ef2-625e7f8f68e3	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-16 23:14:57.932	2025-08-16 23:14:57.932
42	RYLS46SFJJZ	eef97cb7-4f96-461e-912c-4948585c5e55	https://app.midtrans.com/snap/v4/redirection/eef97cb7-4f96-461e-912c-4948585c5e55	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 03:09:37.667	2025-08-17 03:09:37.667
43	RYLS47KBIYK	09577991-e947-4d36-952f-75967971e3d3	https://app.midtrans.com/snap/v4/redirection/09577991-e947-4d36-952f-75967971e3d3	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 03:33:36.409	2025-08-17 03:33:36.409
44	RYLS48EKAE	cf414e0e-7311-4bb2-ae96-0ad039f944ad	https://app.midtrans.com/snap/v4/redirection/cf414e0e-7311-4bb2-ae96-0ad039f944ad	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 06:26:37.807	2025-08-17 06:26:37.807
45	RYLS49XPLNXRD	5503f33e-7bc0-4a34-a4ef-e0d0b01c064e	https://app.midtrans.com/snap/v4/redirection/5503f33e-7bc0-4a34-a4ef-e0d0b01c064e	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 07:13:56.645	2025-08-17 07:13:56.645
46	RYLS50KAXHF	0aca3aca-a687-438e-9a81-4cceca29c5e3	https://app.midtrans.com/snap/v4/redirection/0aca3aca-a687-438e-9a81-4cceca29c5e3	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 07:17:21.016	2025-08-17 07:17:21.016
47	RYLS51LSFY	5991a8a2-2711-4049-b64c-a1b44cbf17c2	https://app.midtrans.com/snap/v4/redirection/5991a8a2-2711-4049-b64c-a1b44cbf17c2	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 07:47:11.589	2025-08-17 07:47:11.589
48	RYLS53ORDYV	14475833-bf7e-4329-b87d-f4f2f7df55b3	https://app.midtrans.com/snap/v4/redirection/14475833-bf7e-4329-b87d-f4f2f7df55b3	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 08:05:34.489	2025-08-17 08:05:34.489
49	RYLS54UYEJQ	a610406c-d412-4208-81dd-7836e92a6f7b	https://app.midtrans.com/snap/v4/redirection/a610406c-d412-4208-81dd-7836e92a6f7b	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 12:19:48.019	2025-08-17 12:19:48.019
50	RYLS55FYRGDG	274e223b-fdb7-4dcd-a6e0-05023df830c3	https://app.midtrans.com/snap/v4/redirection/274e223b-fdb7-4dcd-a6e0-05023df830c3	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 13:40:35.927	2025-08-17 13:40:35.927
51	RYLS56DNXVATB	7b9c5e36-d87c-40ce-99ba-124f481d29d8	https://app.midtrans.com/snap/v4/redirection/7b9c5e36-d87c-40ce-99ba-124f481d29d8	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 14:38:04.52	2025-08-17 14:38:04.52
52	RYLS57VEJMGA	10a243b2-f4b8-4546-90ae-7e3377bebc7e	https://app.midtrans.com/snap/v4/redirection/10a243b2-f4b8-4546-90ae-7e3377bebc7e	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 14:38:19.462	2025-08-17 14:38:19.462
53	RYLS58CZUFPFWW	86ca1722-54ff-4e50-85b6-cc97e0b43d90	https://app.midtrans.com/snap/v4/redirection/86ca1722-54ff-4e50-85b6-cc97e0b43d90	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 14:46:04.166	2025-08-17 14:46:04.166
54	RYLS59HLBXV	f7c82bf0-20aa-462c-904e-7f3bee8ce3a6	https://app.midtrans.com/snap/v4/redirection/f7c82bf0-20aa-462c-904e-7f3bee8ce3a6	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 14:48:41.017	2025-08-17 14:48:41.017
55	RYLS60JKJYQ	0832c9c6-b06b-491b-9cda-2cbd2e0ff012	https://app.midtrans.com/snap/v4/redirection/0832c9c6-b06b-491b-9cda-2cbd2e0ff012	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 15:07:22.611	2025-08-17 15:07:22.611
56	RYLS61ULEITQ	56a13030-958c-41cb-9885-9b7ae4cea37e	https://app.midtrans.com/snap/v4/redirection/56a13030-958c-41cb-9885-9b7ae4cea37e	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 16:27:56.091	2025-08-17 16:27:56.091
57	RYLS62WSKDB	0135f620-9582-405a-9ebd-00900ec47b5f	https://app.midtrans.com/snap/v4/redirection/0135f620-9582-405a-9ebd-00900ec47b5f	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 16:54:12.224	2025-08-17 16:54:12.224
58	RYLS63EDVVD	b2eb30e8-984e-4cd3-ba01-8ad5acc17471	https://app.midtrans.com/snap/v4/redirection/b2eb30e8-984e-4cd3-ba01-8ad5acc17471	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 17:01:27.133	2025-08-17 17:01:27.133
59	RYLS64YAAFU	c82f0445-42da-4434-8d96-29d7c7345274	https://app.midtrans.com/snap/v4/redirection/c82f0445-42da-4434-8d96-29d7c7345274	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 17:17:30.514	2025-08-17 17:17:30.514
60	RYLS65OIZXBMN	7c638a13-7cef-4151-ac7f-db20c009069e	https://app.midtrans.com/snap/v4/redirection/7c638a13-7cef-4151-ac7f-db20c009069e	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 17:44:25.038	2025-08-17 17:44:25.038
61	RYLS66LRQQS	b01eec76-e66d-4780-90bc-7c7489de9938	https://app.midtrans.com/snap/v4/redirection/b01eec76-e66d-4780-90bc-7c7489de9938	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 20:49:16.61	2025-08-17 20:49:16.61
62	RYLS67ACLQN	91edd7ed-1a7e-41a6-a4a5-390fbd53b05b	https://app.midtrans.com/snap/v4/redirection/91edd7ed-1a7e-41a6-a4a5-390fbd53b05b	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-17 22:09:10.548	2025-08-17 22:09:10.548
63	RYLS68YZT	e9308833-b99e-4192-abae-3b6ed6d7fbd5	https://app.midtrans.com/snap/v4/redirection/e9308833-b99e-4192-abae-3b6ed6d7fbd5	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 00:37:17.05	2025-08-18 00:37:17.05
64	RYLS69CZADHUZU	00d252f9-64c3-4a03-ae4d-cd4cb3984ed3	https://app.midtrans.com/snap/v4/redirection/00d252f9-64c3-4a03-ae4d-cd4cb3984ed3	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 02:56:09.02	2025-08-18 02:56:09.02
65	RYLS70AMUWQ	e9865353-297f-4c0c-8f77-05c1cfcc6a8d	https://app.midtrans.com/snap/v4/redirection/e9865353-297f-4c0c-8f77-05c1cfcc6a8d	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 02:56:44.7	2025-08-18 02:56:44.7
66	RYLS71KDLQ	c46660fa-4e33-4a99-b20c-e88a0caca856	https://app.midtrans.com/snap/v4/redirection/c46660fa-4e33-4a99-b20c-e88a0caca856	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 03:35:36.475	2025-08-18 03:35:36.475
67	RYLS72XXTMELV	aaa2f352-dd7c-434d-b122-55a2c5c36b17	https://app.midtrans.com/snap/v4/redirection/aaa2f352-dd7c-434d-b122-55a2c5c36b17	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 04:02:08.07	2025-08-18 04:02:08.07
68	RYLS73OYPKNQU	cda3bcb8-32e9-42ad-a0d3-5a3a1c7a405a	https://app.midtrans.com/snap/v4/redirection/cda3bcb8-32e9-42ad-a0d3-5a3a1c7a405a	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 05:08:05.047	2025-08-18 05:08:05.047
69	RYLS74EAZIY	d845c74f-9186-41a2-af11-e7af6caff69d	https://app.midtrans.com/snap/v4/redirection/d845c74f-9186-41a2-af11-e7af6caff69d	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 06:49:52.869	2025-08-18 06:49:52.869
70	RYLS75GTHON	a4d8394d-6f4f-429d-bf0a-0d872a349d34	https://app.midtrans.com/snap/v4/redirection/a4d8394d-6f4f-429d-bf0a-0d872a349d34	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 07:01:45.799	2025-08-18 07:01:45.799
71	RYLS76YLBF	782a17e0-1a71-43a3-ae4c-e7e505854713	https://app.midtrans.com/snap/v4/redirection/782a17e0-1a71-43a3-ae4c-e7e505854713	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 07:55:45.117	2025-08-18 07:55:45.117
72	RYLS77NNMQIKQT	ac6b298c-03b8-4134-95ef-f5f7c0029bf3	https://app.midtrans.com/snap/v4/redirection/ac6b298c-03b8-4134-95ef-f5f7c0029bf3	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 08:59:59.782	2025-08-18 08:59:59.782
73	RYLS78WDAEE	f298f867-b4ee-4c48-8ea2-3d436f6bda3d	https://app.midtrans.com/snap/v4/redirection/f298f867-b4ee-4c48-8ea2-3d436f6bda3d	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 10:44:35.038	2025-08-18 10:44:35.038
74	RYLS79YRDVS	29f4d843-be00-47f4-8783-83e7e323f13b	https://app.midtrans.com/snap/v4/redirection/29f4d843-be00-47f4-8783-83e7e323f13b	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 10:50:02.8	2025-08-18 10:50:02.8
75	RYLS80AYRBMC	a198c848-127a-44cd-b882-e61c2bbf0e5e	https://app.midtrans.com/snap/v4/redirection/a198c848-127a-44cd-b882-e61c2bbf0e5e	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 10:54:32.52	2025-08-18 10:54:32.52
76	RYLS81JFDGK	fbc08db0-ebb6-4c40-959e-190418f6b0ed	https://app.midtrans.com/snap/v4/redirection/fbc08db0-ebb6-4c40-959e-190418f6b0ed	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 11:27:41.556	2025-08-18 11:27:41.556
77	RYLS82GZTE	72d0fb2a-8669-4b49-bdef-c31205e106fe	https://app.midtrans.com/snap/v4/redirection/72d0fb2a-8669-4b49-bdef-c31205e106fe	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 11:38:07.825	2025-08-18 11:38:07.825
78	RYLS83PFFH	344b8949-b6cd-4014-84c4-22a30c7fa04a	https://app.midtrans.com/snap/v4/redirection/344b8949-b6cd-4014-84c4-22a30c7fa04a	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 11:45:24.66	2025-08-18 11:45:24.66
79	RYLS84OMRDDA	3eb3c795-8bca-49e8-b013-37f1ad155a3c	https://app.midtrans.com/snap/v4/redirection/3eb3c795-8bca-49e8-b013-37f1ad155a3c	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 13:21:52.819	2025-08-18 13:21:52.819
80	RYLS85BRXJLL	a96fb546-0dab-46fb-96f3-bc7c288109c3	https://app.midtrans.com/snap/v4/redirection/a96fb546-0dab-46fb-96f3-bc7c288109c3	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 13:49:31.157	2025-08-18 13:49:31.157
81	RYLS86GKDWF	4263fae7-0e05-4a1e-a4ad-cffc025b37fc	https://app.midtrans.com/snap/v4/redirection/4263fae7-0e05-4a1e-a4ad-cffc025b37fc	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 14:29:48.006	2025-08-18 14:29:48.006
82	RYLS87BXZVM	14956b01-5301-41df-9ecd-e55400afd22a	https://app.midtrans.com/snap/v4/redirection/14956b01-5301-41df-9ecd-e55400afd22a	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 14:54:50.802	2025-08-18 14:54:50.802
83	RYLS88VZGYSZTQ	928ca316-c478-4a2e-9ee4-44b6425d31a8	https://app.midtrans.com/snap/v4/redirection/928ca316-c478-4a2e-9ee4-44b6425d31a8	\N	\N	242803	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 14:56:47.792	2025-08-18 14:56:47.792
84	RYLS89DAKX	662d7267-1c05-4bc6-8492-8a983e088f60	https://app.midtrans.com/snap/v4/redirection/662d7267-1c05-4bc6-8492-8a983e088f60	\N	\N	243274	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 21:02:22.495	2025-08-18 21:02:22.495
85	RYLS90LGQDTT	ee6e456d-d99a-4367-853c-aada8e0462c2	https://app.midtrans.com/snap/v4/redirection/ee6e456d-d99a-4367-853c-aada8e0462c2	\N	\N	243275	IDR	pending	\N	{}	{}	\N	\N	2025-08-18 23:34:48.084	2025-08-18 23:34:48.084
86	RYLS91CLFYKCL	9d8c1e58-fe13-412f-b045-0c7806f6b273	https://app.midtrans.com/snap/v4/redirection/9d8c1e58-fe13-412f-b045-0c7806f6b273	\N	\N	243317	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 01:09:28.15	2025-08-19 01:09:28.15
87	RYLS92IUYUL	92edd676-dcdd-4a26-8506-187034144af5	https://app.midtrans.com/snap/v4/redirection/92edd676-dcdd-4a26-8506-187034144af5	\N	\N	243317	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 01:11:03.49	2025-08-19 01:11:03.49
88	RYLS93ASVEBYJ	8fadb252-b58c-4425-b3e7-a21fdf98c4fa	https://app.midtrans.com/snap/v4/redirection/8fadb252-b58c-4425-b3e7-a21fdf98c4fa	\N	\N	243343	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 01:26:04.298	2025-08-19 01:26:04.298
89	RYLS94TZFCZM	3a855a2a-ff0a-466e-854d-b1cd3830a06d	https://app.midtrans.com/snap/v4/redirection/3a855a2a-ff0a-466e-854d-b1cd3830a06d	\N	\N	243269	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 01:33:59.353	2025-08-19 01:33:59.353
90	RYLS95TEOLSN	9529154f-5b9c-4793-a996-c64a5378aedd	https://app.midtrans.com/snap/v4/redirection/9529154f-5b9c-4793-a996-c64a5378aedd	\N	\N	243411	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 01:45:47.587	2025-08-19 01:45:47.587
91	RYLS96VORORNB	9b5cfe87-7df3-4fca-a951-561c4c87bae3	https://app.midtrans.com/snap/v4/redirection/9b5cfe87-7df3-4fca-a951-561c4c87bae3	\N	\N	243414	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 01:47:59.383	2025-08-19 01:47:59.383
92	RYLS97XEI	5bc11206-0ccd-4cb1-8933-893ce12ddb6a	https://app.midtrans.com/snap/v4/redirection/5bc11206-0ccd-4cb1-8933-893ce12ddb6a	\N	\N	243675	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 02:26:41.024	2025-08-19 02:26:41.024
93	RYLS98KXMQ	d8b210ad-da8d-41b1-abdc-800bb0010532	https://app.midtrans.com/snap/v4/redirection/d8b210ad-da8d-41b1-abdc-800bb0010532	\N	\N	243637	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 02:52:04.469	2025-08-19 02:52:04.469
94	RYLS99RRYZK	4d935428-0534-406e-8a8b-7570945db9d6	https://app.midtrans.com/snap/v4/redirection/4d935428-0534-406e-8a8b-7570945db9d6	\N	\N	243494	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 03:17:14.121	2025-08-19 03:17:14.121
95	RYLS100UTRLAV	ece09798-3ca1-46d8-a59f-c885d9d3edfe	https://app.midtrans.com/snap/v4/redirection/ece09798-3ca1-46d8-a59f-c885d9d3edfe	\N	\N	243494	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 03:17:33.837	2025-08-19 03:17:33.837
96	RYLS102ISUVFO	3d53671d-3e6a-4428-bc41-f1a98dea8474	https://app.midtrans.com/snap/v4/redirection/3d53671d-3e6a-4428-bc41-f1a98dea8474	\N	\N	243406	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 03:31:24.213	2025-08-19 03:31:24.213
97	RYLS103RXNKNX	d7a8bd23-5b56-42d4-bf92-e06b089e5213	https://app.midtrans.com/snap/v4/redirection/d7a8bd23-5b56-42d4-bf92-e06b089e5213	\N	\N	243438	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 03:47:51.301	2025-08-19 03:47:51.301
98	RYLS104XDXDH	3028fb62-d69e-4e9f-b74a-f704e8a54fee	https://app.midtrans.com/snap/v4/redirection/3028fb62-d69e-4e9f-b74a-f704e8a54fee	\N	\N	243417	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 03:55:46.247	2025-08-19 03:55:46.247
99	RYLS105TQROP	4a282ff0-365e-4c05-aaaa-2e9758aba58b	https://app.midtrans.com/snap/v4/redirection/4a282ff0-365e-4c05-aaaa-2e9758aba58b	\N	\N	243476	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 04:13:18.757	2025-08-19 04:13:18.757
100	RYLS106BURNBRG	88a22909-0f4a-4505-92af-bf86c49f94ae	https://app.midtrans.com/snap/v4/redirection/88a22909-0f4a-4505-92af-bf86c49f94ae	\N	\N	243529	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 04:56:40.207	2025-08-19 04:56:40.207
101	RYLS107LZEFTAL	62fbcac6-f13d-4260-8df4-f139b6837138	https://app.midtrans.com/snap/v4/redirection/62fbcac6-f13d-4260-8df4-f139b6837138	\N	\N	243550	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 06:04:42.843	2025-08-19 06:04:42.843
102	RYLS108LZQPDPS	8732537a-586a-45c4-8337-95f40b314c4e	https://app.midtrans.com/snap/v4/redirection/8732537a-586a-45c4-8337-95f40b314c4e	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 06:15:03.08	2025-08-19 06:15:03.08
103	RYLS109MOWNPTI	9a3c03fb-2db0-486d-baad-da6cb23eb468	https://app.midtrans.com/snap/v4/redirection/9a3c03fb-2db0-486d-baad-da6cb23eb468	\N	\N	243726	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:03:52.122	2025-08-19 07:03:52.122
104	RYLS110RPYXH	72fbba92-a572-4432-937f-93cfc4672ca7	https://app.midtrans.com/snap/v4/redirection/72fbba92-a572-4432-937f-93cfc4672ca7	\N	\N	243740	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:06:13.748	2025-08-19 07:06:13.748
105	RYLS111YPRZ	a9d7ccf4-3b87-4366-acf0-4e672a8678b0	https://app.midtrans.com/snap/v4/redirection/a9d7ccf4-3b87-4366-acf0-4e672a8678b0	\N	\N	243725	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:09:08.388	2025-08-19 07:09:08.388
106	RYLS112TYBJR	7b86e84c-df3f-40f8-9109-b723c3a9c79d	https://app.midtrans.com/snap/v4/redirection/7b86e84c-df3f-40f8-9109-b723c3a9c79d	\N	\N	243725	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:09:20.104	2025-08-19 07:09:20.104
107	RYLS113NDHDPEFJ	90ab0142-f25e-4d86-a8b4-221745de4457	https://app.midtrans.com/snap/v4/redirection/90ab0142-f25e-4d86-a8b4-221745de4457	\N	\N	243677	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:12:32.125	2025-08-19 07:12:32.125
108	RYLS114OHPMUCS	457be8f4-333e-4a4b-83ab-7a3c76966e90	https://app.midtrans.com/snap/v4/redirection/457be8f4-333e-4a4b-83ab-7a3c76966e90	\N	\N	243677	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:12:46.497	2025-08-19 07:12:46.497
109	RYLS115HXDUMF	5fb3ead7-b4a1-45cb-a6f1-57cd51a0c73a	https://app.midtrans.com/snap/v4/redirection/5fb3ead7-b4a1-45cb-a6f1-57cd51a0c73a	\N	\N	243708	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:14:24.332	2025-08-19 07:14:24.332
110	RYLS116IGUBYS	fb7d2a30-3935-42a1-8696-72e8c3fd93d7	https://app.midtrans.com/snap/v4/redirection/fb7d2a30-3935-42a1-8696-72e8c3fd93d7	\N	\N	243708	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:14:49.81	2025-08-19 07:14:49.81
111	RYLS117QQEAVYYW	2314b5a1-8b15-4aa2-8efc-75fdeaa0dcc1	https://app.midtrans.com/snap/v4/redirection/2314b5a1-8b15-4aa2-8efc-75fdeaa0dcc1	\N	\N	243745	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:19:51.518	2025-08-19 07:19:51.518
112	RYLS118VMYVXNS	9b9b34f3-fa3e-4dd2-ab28-2888d236efcf	https://app.midtrans.com/snap/v4/redirection/9b9b34f3-fa3e-4dd2-ab28-2888d236efcf	\N	\N	243737	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:24:00.408	2025-08-19 07:24:00.408
113	RYLS119UCTPB	98bbeca3-1902-473a-ab38-d2c65fcca725	https://app.midtrans.com/snap/v4/redirection/98bbeca3-1902-473a-ab38-d2c65fcca725	\N	\N	243737	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:24:40.703	2025-08-19 07:24:40.703
114	RYLS120YRROR	d29d1753-4afa-49d3-b900-73e82031a1a0	https://app.midtrans.com/snap/v4/redirection/d29d1753-4afa-49d3-b900-73e82031a1a0	\N	\N	243735	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:28:24.184	2025-08-19 07:28:24.184
115	RYLS121FMVYQTW	68507b9b-4728-4bee-af47-abe90dc601b4	https://app.midtrans.com/snap/v4/redirection/68507b9b-4728-4bee-af47-abe90dc601b4	\N	\N	243787	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:31:11.968	2025-08-19 07:31:11.968
116	RYLS122RBXMOK	628bead9-c654-46ec-ada5-fec718a45d3f	https://app.midtrans.com/snap/v4/redirection/628bead9-c654-46ec-ada5-fec718a45d3f	\N	\N	243778	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:32:25.811	2025-08-19 07:32:25.811
117	RYLS123JVYDYJA	2b0638ff-4e05-480a-a5fd-a9c7e980b1eb	https://app.midtrans.com/snap/v4/redirection/2b0638ff-4e05-480a-a5fd-a9c7e980b1eb	\N	\N	243778	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:33:43.322	2025-08-19 07:33:43.322
118	RYLS124FKXBLPB	da7d0de3-b52b-4a1c-8251-208c2585797f	https://app.midtrans.com/snap/v4/redirection/da7d0de3-b52b-4a1c-8251-208c2585797f	\N	\N	243716	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:39:33.327	2025-08-19 07:39:33.327
119	RYLS125DCKLBKT	bc5b3918-6a59-4f4f-96d7-646dd2d79894	https://app.midtrans.com/snap/v4/redirection/bc5b3918-6a59-4f4f-96d7-646dd2d79894	\N	\N	243722	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:44:27.93	2025-08-19 07:44:27.93
120	RYLS126BJOVUJ	4a186059-eada-4b1f-89e9-2b674a1486be	https://app.midtrans.com/snap/v4/redirection/4a186059-eada-4b1f-89e9-2b674a1486be	\N	\N	243718	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 07:51:18.359	2025-08-19 07:51:18.359
121	RYLS127UNKUEH	986a25a8-17f3-49ee-933d-5da47cd56d26	https://app.midtrans.com/snap/v4/redirection/986a25a8-17f3-49ee-933d-5da47cd56d26	\N	\N	243791	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 08:05:23.246	2025-08-19 08:05:23.246
122	RYLS128VMNXVF	d9c6c556-2663-4c64-9346-2e7e31f0fe35	https://app.midtrans.com/snap/v4/redirection/d9c6c556-2663-4c64-9346-2e7e31f0fe35	\N	\N	243905	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 08:15:20.488	2025-08-19 08:15:20.488
123	RYLS129OYRPH	dd1d3966-8324-4956-bd7d-7e17377b40b2	https://app.midtrans.com/snap/v4/redirection/dd1d3966-8324-4956-bd7d-7e17377b40b2	\N	\N	243910	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 08:32:50.338	2025-08-19 08:32:50.338
124	RYLS130ASSH	889137db-b112-4b3f-910a-a3f225168d78	https://app.midtrans.com/snap/v4/redirection/889137db-b112-4b3f-910a-a3f225168d78	\N	\N	243945	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 08:51:57.521	2025-08-19 08:51:57.521
125	RYLS131EYJFMKO	372f670d-3813-4b9c-a884-b0dd56a3807a	https://app.midtrans.com/snap/v4/redirection/372f670d-3813-4b9c-a884-b0dd56a3807a	\N	\N	243917	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 09:07:25.185	2025-08-19 09:07:25.185
126	RYLS132MTUDP	8c58b12c-99f9-428b-8623-2a6d9eb2b7a5	https://app.midtrans.com/snap/v4/redirection/8c58b12c-99f9-428b-8623-2a6d9eb2b7a5	\N	\N	243968	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 09:35:50.175	2025-08-19 09:35:50.175
127	RYLS133FZJ	94a3e896-16ca-49e6-a48b-a65085e3fe7c	https://app.midtrans.com/snap/v4/redirection/94a3e896-16ca-49e6-a48b-a65085e3fe7c	\N	\N	243922	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 10:06:48.799	2025-08-19 10:06:48.799
128	RYLS135KCBIAFA	9882e718-0261-422d-80b4-02468169ab39	https://app.midtrans.com/snap/v4/redirection/9882e718-0261-422d-80b4-02468169ab39	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 10:23:43.852	2025-08-19 10:23:43.852
129	RYLS136LVNVWJJ	1641d686-4215-4fd5-9d1e-5e806b475643	https://app.midtrans.com/snap/v4/redirection/1641d686-4215-4fd5-9d1e-5e806b475643	\N	\N	243884	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 10:41:07.222	2025-08-19 10:41:07.222
130	RYLS137JXGQKR	128fe0f1-ae0f-4dc0-b5d6-ad8f7b727b3a	https://app.midtrans.com/snap/v4/redirection/128fe0f1-ae0f-4dc0-b5d6-ad8f7b727b3a	\N	\N	243884	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 10:42:39.963	2025-08-19 10:42:39.963
131	RYLS138TAKJ	5ad5db69-7adb-4915-9492-9efdaab39fc9	https://app.midtrans.com/snap/v4/redirection/5ad5db69-7adb-4915-9492-9efdaab39fc9	\N	\N	243883	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 11:10:11.985	2025-08-19 11:10:11.985
132	RYLS139CZBER	ec54f99f-c75a-40e9-a95c-217796b25ebf	https://app.midtrans.com/snap/v4/redirection/ec54f99f-c75a-40e9-a95c-217796b25ebf	\N	\N	243773	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 11:22:14.666	2025-08-19 11:22:14.666
133	RYLS140WFVMM	ab529fb3-b3dd-429b-b3a8-14b38ed92785	https://app.midtrans.com/snap/v4/redirection/ab529fb3-b3dd-429b-b3a8-14b38ed92785	\N	\N	243770	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 11:33:35.782	2025-08-19 11:33:35.782
134	RYLS141PGQG	f8396ebd-f9e5-4041-a722-a10bb107eec5	https://app.midtrans.com/snap/v4/redirection/f8396ebd-f9e5-4041-a722-a10bb107eec5	\N	\N	243769	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 11:35:06.363	2025-08-19 11:35:06.363
135	RYLS142OEVHYQVO	8fd02b92-aaea-478a-b146-0ae96fcafac2	https://app.midtrans.com/snap/v4/redirection/8fd02b92-aaea-478a-b146-0ae96fcafac2	\N	\N	243801	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 11:50:28.219	2025-08-19 11:50:28.219
136	RYLS143PCIDQY	a89c7352-57e2-4b4b-86e8-d022733d0d43	https://app.midtrans.com/snap/v4/redirection/a89c7352-57e2-4b4b-86e8-d022733d0d43	\N	\N	243801	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 11:54:28.219	2025-08-19 11:54:28.219
137	RYLS144IIKQAE	8b1aa739-205f-4a35-9c76-cf5dc40e053e	https://app.midtrans.com/snap/v4/redirection/8b1aa739-205f-4a35-9c76-cf5dc40e053e	\N	\N	243885	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 12:50:45.576	2025-08-19 12:50:45.576
138	RYLS145UGWFA	eb982441-2f55-4253-bf7a-8ef92530fdfd	https://app.midtrans.com/snap/v4/redirection/eb982441-2f55-4253-bf7a-8ef92530fdfd	\N	\N	243953	IDR	pending	\N	{}	{}	\N	\N	2025-08-19 13:05:23.951	2025-08-19 13:05:23.951
139	RYLS150FUEMB	2de9196b-9419-4ead-869c-8af8d9aac8a7	https://app.midtrans.com/snap/v4/redirection/2de9196b-9419-4ead-869c-8af8d9aac8a7	\N	\N	243411	IDR	pending	\N	{}	{}	\N	\N	2025-08-20 18:06:17.747	2025-08-20 18:06:17.747
140	RYLS151CYH	933983eb-b0dc-428e-a82f-e85fe6658a4d	https://app.midtrans.com/snap/v4/redirection/933983eb-b0dc-428e-a82f-e85fe6658a4d	\N	\N	243411	IDR	pending	\N	{}	{}	\N	\N	2025-08-20 18:10:04.711	2025-08-20 18:10:04.711
141	RYLS152VVZMES	5a5d324c-3119-411c-a49a-7a9b3b4f1e82	https://app.midtrans.com/snap/v4/redirection/5a5d324c-3119-411c-a49a-7a9b3b4f1e82	\N	\N	243411	IDR	pending	\N	{}	{}	\N	\N	2025-08-20 18:26:36.278	2025-08-20 18:26:36.278
142	RYLS154IRYXYDT	4f6710b3-2870-4481-ba81-ae2fc44371a8	https://app.midtrans.com/snap/v4/redirection/4f6710b3-2870-4481-ba81-ae2fc44371a8	\N	\N	243411	IDR	pending	\N	{}	{}	\N	\N	2025-08-20 21:23:29.229	2025-08-20 21:23:29.229
143	RYLS155KEGXM	026ddf95-e941-41bb-ada6-9e784890624c	https://app.midtrans.com/snap/v4/redirection/026ddf95-e941-41bb-ada6-9e784890624c	\N	\N	243411	IDR	pending	\N	{}	{}	\N	\N	2025-08-20 21:26:52.425	2025-08-20 21:26:52.425
144	RYLS156RZZXZ	4ec29c04-90de-4d59-80d8-9efe64d33e4c	https://app.midtrans.com/snap/v4/redirection/4ec29c04-90de-4d59-80d8-9efe64d33e4c	\N	\N	243411	IDR	pending	\N	{}	{}	\N	\N	2025-08-20 21:47:35.365	2025-08-20 21:47:35.365
145	RYLS157OZSHH	a0e237d8-c85c-4ef0-bb55-73f1bb5d82f4	https://app.midtrans.com/snap/v4/redirection/a0e237d8-c85c-4ef0-bb55-73f1bb5d82f4	\N	\N	243411	IDR	pending	\N	{}	{}	\N	\N	2025-08-20 23:27:04.626	2025-08-20 23:27:04.626
146	RYLS158LWLS	6523f7c9-a300-4fac-82a9-7e20676c8dfc	https://app.midtrans.com/snap/v4/redirection/6523f7c9-a300-4fac-82a9-7e20676c8dfc	\N	\N	243411	IDR	pending	\N	{}	{}	\N	\N	2025-08-20 23:28:52.626	2025-08-20 23:28:52.626
147	RYLS159ONHUFP	4d6cd986-c619-496e-8b6d-73297172ab49	https://app.midtrans.com/snap/v4/redirection/4d6cd986-c619-496e-8b6d-73297172ab49	\N	\N	243411	IDR	pending	\N	{}	{}	\N	\N	2025-08-20 23:39:45.089	2025-08-20 23:39:45.089
148	RYLS161PRTCWM	9a46d595-d749-4ee6-8840-a93ecf56bcec	https://app.midtrans.com/snap/v4/redirection/9a46d595-d749-4ee6-8840-a93ecf56bcec	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 01:10:46.141	2025-08-21 01:10:46.141
149	RYLS162GCBOUB	95f553c7-447c-46e7-a919-2fea52e03898	https://app.midtrans.com/snap/v4/redirection/95f553c7-447c-46e7-a919-2fea52e03898	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 02:21:25.4	2025-08-21 02:21:25.4
150	RYLS163IRNFMZIB	78c31c51-4f46-4df3-946d-d21f55363d49	https://app.midtrans.com/snap/v4/redirection/78c31c51-4f46-4df3-946d-d21f55363d49	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 02:23:50.859	2025-08-21 02:23:50.859
151	RYLS164CUJNKF	69a87358-da90-4169-80f3-95d402856631	https://app.midtrans.com/snap/v4/redirection/69a87358-da90-4169-80f3-95d402856631	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 02:52:49.149	2025-08-21 02:52:49.149
152	RYLS167QMDFDXV	43b6ad9b-7b8b-4f08-9bb2-bdc14ad5856f	https://app.midtrans.com/snap/v4/redirection/43b6ad9b-7b8b-4f08-9bb2-bdc14ad5856f	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 03:45:47.344	2025-08-21 03:45:47.344
153	RYLS168FHEIVXE	1b489aca-73aa-4d44-b436-16b6603100f8	https://app.midtrans.com/snap/v4/redirection/1b489aca-73aa-4d44-b436-16b6603100f8	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 03:52:06.951	2025-08-21 03:52:06.951
154	RYLS169YSB	231aea95-6313-48b4-a517-d98b9ff36fba	https://app.midtrans.com/snap/v4/redirection/231aea95-6313-48b4-a517-d98b9ff36fba	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 04:13:10.469	2025-08-21 04:13:10.469
155	RYLS170VIZORO	c356ca6b-4ef7-405d-b4f3-9a512e53c2f9	https://app.midtrans.com/snap/v4/redirection/c356ca6b-4ef7-405d-b4f3-9a512e53c2f9	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 04:24:12.323	2025-08-21 04:24:12.323
156	RYLS171TWIDQED	68532d3d-cd4a-4645-9258-12a5a19b8528	https://app.midtrans.com/snap/v4/redirection/68532d3d-cd4a-4645-9258-12a5a19b8528	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 04:53:50.676	2025-08-21 04:53:50.676
157	RYLS174CWVHI	773ccc49-9c26-4ea9-8975-0a23e0a84076	https://app.midtrans.com/snap/v4/redirection/773ccc49-9c26-4ea9-8975-0a23e0a84076	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 04:59:23.454	2025-08-21 04:59:23.454
158	RYLS175MSCYX	4c997a12-f9c8-4176-920e-1c6fac5da57d	https://app.midtrans.com/snap/v4/redirection/4c997a12-f9c8-4176-920e-1c6fac5da57d	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 05:07:56.056	2025-08-21 05:07:56.056
159	RYLS178DFPKP	626d43ec-b921-4b59-ac62-86c22187246a	https://app.midtrans.com/snap/v4/redirection/626d43ec-b921-4b59-ac62-86c22187246a	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 05:39:07.652	2025-08-21 05:39:07.652
160	RYLS179SUZCXSPY	397fd095-22e7-4c79-853c-1f80dd7b865b	https://app.midtrans.com/snap/v4/redirection/397fd095-22e7-4c79-853c-1f80dd7b865b	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 05:41:53.718	2025-08-21 05:41:53.718
161	RYLS180CXRHMRV	efcc6e1d-a768-4dc6-88ad-1605eee06e1d	https://app.midtrans.com/snap/v4/redirection/efcc6e1d-a768-4dc6-88ad-1605eee06e1d	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 05:55:47.497	2025-08-21 05:55:47.497
162	RYLS181MPBBTYY	e8c84e80-59d4-49c5-ae14-30f0658a01dc	https://app.midtrans.com/snap/v4/redirection/e8c84e80-59d4-49c5-ae14-30f0658a01dc	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 05:56:53.116	2025-08-21 05:56:53.116
163	RYLS182KNCWIN	c34a2308-b91f-4470-9a09-0037c073f9a0	https://app.midtrans.com/snap/v4/redirection/c34a2308-b91f-4470-9a09-0037c073f9a0	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 05:58:34.297	2025-08-21 05:58:34.297
164	RYLS183EYWJLJ	80a44034-b911-4936-9a3e-23ce5cff5bf7	https://app.midtrans.com/snap/v4/redirection/80a44034-b911-4936-9a3e-23ce5cff5bf7	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 06:14:04.523	2025-08-21 06:14:04.523
165	RYLS184ODQF	19bfed1d-8429-4f5c-b4b5-a8cd0a7f782f	https://app.midtrans.com/snap/v4/redirection/19bfed1d-8429-4f5c-b4b5-a8cd0a7f782f	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 06:16:59.603	2025-08-21 06:16:59.603
166	RYLS185TWFB	e692aff8-6d79-403e-9736-d1de536374b2	https://app.midtrans.com/snap/v4/redirection/e692aff8-6d79-403e-9736-d1de536374b2	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 06:19:28.768	2025-08-21 06:19:28.768
167	RYLS186JTIGIF	9250d250-c2a0-4248-82a8-85dc35026f49	https://app.midtrans.com/snap/v4/redirection/9250d250-c2a0-4248-82a8-85dc35026f49	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 06:42:38.311	2025-08-21 06:42:38.311
168	RYLS187EXGKPMRQ	36a79745-6f57-4c76-865f-2b1533395856	https://app.midtrans.com/snap/v4/redirection/36a79745-6f57-4c76-865f-2b1533395856	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 06:53:21.995	2025-08-21 06:53:21.995
169	RYLS188MCQZMRYT	428b7668-99d1-49e1-ab34-6e825f969217	https://app.midtrans.com/snap/v4/redirection/428b7668-99d1-49e1-ab34-6e825f969217	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 07:09:36.994	2025-08-21 07:09:36.994
170	RYLS189CLMXH	0cf6909a-9505-4598-b4ac-a3cd63253fc4	https://app.midtrans.com/snap/v4/redirection/0cf6909a-9505-4598-b4ac-a3cd63253fc4	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 09:21:14.085	2025-08-21 09:21:14.085
171	RYLS190DSNIJV	98897cac-3812-48df-b26b-4fa2c507e837	https://app.midtrans.com/snap/v4/redirection/98897cac-3812-48df-b26b-4fa2c507e837	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 09:29:00.042	2025-08-21 09:29:00.042
172	RYLS191RFACJW	74fa430e-612d-40ca-8275-e7f841c48204	https://app.midtrans.com/snap/v4/redirection/74fa430e-612d-40ca-8275-e7f841c48204	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 09:55:11.659	2025-08-21 09:55:11.659
173	RYLS192XVGU	c8662e28-a9a0-4b53-a945-cf8b3a75572b	https://app.midtrans.com/snap/v4/redirection/c8662e28-a9a0-4b53-a945-cf8b3a75572b	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 10:03:13.884	2025-08-21 10:03:13.884
174	RYLS193YJTNSZM	5d16e3c3-7fbc-4454-87ec-add51d410f94	https://app.midtrans.com/snap/v4/redirection/5d16e3c3-7fbc-4454-87ec-add51d410f94	\N	\N	12175041	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 10:12:05.86	2025-08-21 10:12:05.86
175	RYLS194SWZ	6bc45d2b-e5db-4451-854b-35404908bc73	https://app.midtrans.com/snap/v4/redirection/6bc45d2b-e5db-4451-854b-35404908bc73	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 11:06:39.493	2025-08-21 11:06:39.493
176	RYLS195UIOI	819b4e57-c5fe-4433-81c9-c903232cafc6	https://app.midtrans.com/snap/v4/redirection/819b4e57-c5fe-4433-81c9-c903232cafc6	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 11:21:46.008	2025-08-21 11:21:46.008
177	RYLS196HBRDN	680238af-b94b-417f-a812-21288ecfd367	https://app.midtrans.com/snap/v4/redirection/680238af-b94b-417f-a812-21288ecfd367	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 11:25:43.974	2025-08-21 11:25:43.974
178	RYLS197YBUEJ	32dadadf-71b1-42ad-9cc9-26d96bd01e75	https://app.midtrans.com/snap/v4/redirection/32dadadf-71b1-42ad-9cc9-26d96bd01e75	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 11:27:01.773	2025-08-21 11:27:01.773
179	RYLS198PKKPM	bd96d8ac-95a2-4ee5-86b0-e0208e933055	https://app.midtrans.com/snap/v4/redirection/bd96d8ac-95a2-4ee5-86b0-e0208e933055	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 11:33:26.934	2025-08-21 11:33:26.934
180	RYLS199RYQKR	d166bbb4-53b9-4977-a4b3-e708f0091913	https://app.midtrans.com/snap/v4/redirection/d166bbb4-53b9-4977-a4b3-e708f0091913	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 12:00:30.47	2025-08-21 12:00:30.47
181	RYLS200VCFSG	6c95cbeb-2f71-47c2-9d99-f24fd41bf22c	https://app.midtrans.com/snap/v4/redirection/6c95cbeb-2f71-47c2-9d99-f24fd41bf22c	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 12:53:52.601	2025-08-21 12:53:52.601
182	RYLS201PGV	026b2b6e-657d-44d3-80aa-c5e88ff07f9d	https://app.midtrans.com/snap/v4/redirection/026b2b6e-657d-44d3-80aa-c5e88ff07f9d	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 12:53:58.996	2025-08-21 12:53:58.996
183	RYLS202DEXJ	e3c37172-f108-4e8e-86c7-b366aaec814a	https://app.midtrans.com/snap/v4/redirection/e3c37172-f108-4e8e-86c7-b366aaec814a	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 13:14:12.401	2025-08-21 13:14:12.401
184	RYLS203YOWR	787ff47f-57f1-41ff-848c-57ddbcdcb60f	https://app.midtrans.com/snap/v4/redirection/787ff47f-57f1-41ff-848c-57ddbcdcb60f	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 13:25:11.768	2025-08-21 13:25:11.768
185	RYLS204DAUWO	d50d9947-40e5-49ea-b045-944ef34558fb	https://app.midtrans.com/snap/v4/redirection/d50d9947-40e5-49ea-b045-944ef34558fb	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 14:05:46.176	2025-08-21 14:05:46.176
186	RYLS205GTWLWII	3846cca6-026e-44e0-80fa-21ed9048f226	https://app.midtrans.com/snap/v4/redirection/3846cca6-026e-44e0-80fa-21ed9048f226	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 14:15:16.393	2025-08-21 14:15:16.393
187	RYLS206WRFSDTV	e938b930-09cf-4e5c-8fd6-2289611d018c	https://app.midtrans.com/snap/v4/redirection/e938b930-09cf-4e5c-8fd6-2289611d018c	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 14:16:35.763	2025-08-21 14:16:35.763
188	RYLS207IJHUP	d68b82d9-20d6-49e1-bf02-c41f73bb9f46	https://app.midtrans.com/snap/v4/redirection/d68b82d9-20d6-49e1-bf02-c41f73bb9f46	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 14:35:07.88	2025-08-21 14:35:07.88
189	RYLS208TSETDU	f2e7ee53-bc36-4ed4-afbc-b562675f3c33	https://app.midtrans.com/snap/v4/redirection/f2e7ee53-bc36-4ed4-afbc-b562675f3c33	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 15:55:08.943	2025-08-21 15:55:08.943
190	RYLS209GOHLN	3ebe5453-65e6-4903-a9e0-af1faf9a2e54	https://app.midtrans.com/snap/v4/redirection/3ebe5453-65e6-4903-a9e0-af1faf9a2e54	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 16:31:53.42	2025-08-21 16:31:53.42
191	RYLS210FSVTMZ	7b80383d-cd71-4823-b4b5-4b51b6582c52	https://app.midtrans.com/snap/v4/redirection/7b80383d-cd71-4823-b4b5-4b51b6582c52	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 16:46:27.77	2025-08-21 16:46:27.77
192	RYLS211JHOGN	2ff00d85-5151-4d96-b1b7-e9f1aca81451	https://app.midtrans.com/snap/v4/redirection/2ff00d85-5151-4d96-b1b7-e9f1aca81451	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 20:33:19.788	2025-08-21 20:33:19.788
193	RYLS212EVVFZO	d9902233-eb63-425c-92b9-fcc51065d79a	https://app.midtrans.com/snap/v4/redirection/d9902233-eb63-425c-92b9-fcc51065d79a	\N	\N	243501	IDR	pending	\N	{}	{}	\N	\N	2025-08-21 23:40:52.649	2025-08-21 23:40:52.649
194	RYLS213CXOFXW	1c1a4328-4aa1-46a8-9bdf-dad38e05b7a7	https://app.midtrans.com/snap/v4/redirection/1c1a4328-4aa1-46a8-9bdf-dad38e05b7a7	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 02:08:48.465	2025-08-22 02:08:48.465
195	RYLS214SLOZZUC	01f84d96-9419-4c18-92ab-0aee1a1d1212	https://app.midtrans.com/snap/v4/redirection/01f84d96-9419-4c18-92ab-0aee1a1d1212	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 02:28:38.704	2025-08-22 02:28:38.704
196	RYLS215LNCD	bcb2e65d-5f0d-42e0-97e7-4ccb3191562c	https://app.midtrans.com/snap/v4/redirection/bcb2e65d-5f0d-42e0-97e7-4ccb3191562c	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 02:28:47.7	2025-08-22 02:28:47.7
197	RYLS216USGUDUT	e34934d8-3a58-4a7d-b077-8b4aea253dea	https://app.midtrans.com/snap/v4/redirection/e34934d8-3a58-4a7d-b077-8b4aea253dea	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 02:57:54.291	2025-08-22 02:57:54.291
198	RYLS217SFPWY	5b177fd7-7d2c-441e-9613-5fdc96ef0837	https://app.midtrans.com/snap/v4/redirection/5b177fd7-7d2c-441e-9613-5fdc96ef0837	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 03:26:33.602	2025-08-22 03:26:33.602
199	RYLS218TIIFDQC	ce504ba8-eeff-43f9-b61c-de8e3f07f4a2	https://app.midtrans.com/snap/v4/redirection/ce504ba8-eeff-43f9-b61c-de8e3f07f4a2	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 04:36:54.597	2025-08-22 04:36:54.597
200	RYLS219CWBOMS	459e0d91-32a5-4b7a-b2ba-2b1b8901b029	https://app.midtrans.com/snap/v4/redirection/459e0d91-32a5-4b7a-b2ba-2b1b8901b029	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 05:19:32.75	2025-08-22 05:19:32.75
201	RYLS220RZZPJBEP	3340296e-b5f2-4619-b166-48f4e175efbf	https://app.midtrans.com/snap/v4/redirection/3340296e-b5f2-4619-b166-48f4e175efbf	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 05:23:00.188	2025-08-22 05:23:00.188
202	RYLS221GHEMV	f9aaf6c4-519e-4f8d-865d-e56cd18f95c8	https://app.midtrans.com/snap/v4/redirection/f9aaf6c4-519e-4f8d-865d-e56cd18f95c8	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 05:43:49.726	2025-08-22 05:43:49.726
203	RYLS222MFGGXG	46521c86-b2be-4614-9f55-0a43078ae9af	https://app.midtrans.com/snap/v4/redirection/46521c86-b2be-4614-9f55-0a43078ae9af	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 05:49:08.41	2025-08-22 05:49:08.41
204	RYLS223WUJRQP	0d541dc0-4f52-411b-b87e-503a628230c8	https://app.midtrans.com/snap/v4/redirection/0d541dc0-4f52-411b-b87e-503a628230c8	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 06:24:06.264	2025-08-22 06:24:06.264
205	RYLS224KWZHD	21990a67-0b6b-4f1c-a09f-6d304e38303c	https://app.midtrans.com/snap/v4/redirection/21990a67-0b6b-4f1c-a09f-6d304e38303c	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 06:47:03.624	2025-08-22 06:47:03.624
206	RYLS225IYHBD	b0a2d5d3-f293-4cc7-aa1c-3e1ac1dd9e59	https://app.midtrans.com/snap/v4/redirection/b0a2d5d3-f293-4cc7-aa1c-3e1ac1dd9e59	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 09:15:28.686	2025-08-22 09:15:28.686
207	RYLS226LRLFRG	8bd8cb3c-9daf-49cf-911f-13f9965759e9	https://app.midtrans.com/snap/v4/redirection/8bd8cb3c-9daf-49cf-911f-13f9965759e9	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 09:35:43.736	2025-08-22 09:35:43.736
208	RYLS227EQRMVSYG	7dce7efe-3510-4e01-b824-7aeea3fa173a	https://app.midtrans.com/snap/v4/redirection/7dce7efe-3510-4e01-b824-7aeea3fa173a	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 09:37:05.129	2025-08-22 09:37:05.129
209	RYLS228CUKNOPH	7bc051e9-a99c-4b6c-a6cc-5e4c12f5a757	https://app.midtrans.com/snap/v4/redirection/7bc051e9-a99c-4b6c-a6cc-5e4c12f5a757	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 11:58:04.29	2025-08-22 11:58:04.29
210	RYLS229UUDC	71caf4ea-2ddf-41e5-b032-17296511033b	https://app.midtrans.com/snap/v4/redirection/71caf4ea-2ddf-41e5-b032-17296511033b	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 12:58:00.061	2025-08-22 12:58:00.061
211	RYLS230FEMUCBQ	c5a59734-ca5d-43ea-8a11-722a7ad11f9a	https://app.midtrans.com/snap/v4/redirection/c5a59734-ca5d-43ea-8a11-722a7ad11f9a	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 13:22:55.424	2025-08-22 13:22:55.424
212	RYLS232JZCDOX	c34b85b1-0f1f-4778-bbc9-e2e2d2194693	https://app.midtrans.com/snap/v4/redirection/c34b85b1-0f1f-4778-bbc9-e2e2d2194693	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 15:10:46.895	2025-08-22 15:10:46.895
213	RYLS233TTIFL	12dc7df3-a89e-4811-a2dd-b2b45e6c56ca	https://app.midtrans.com/snap/v4/redirection/12dc7df3-a89e-4811-a2dd-b2b45e6c56ca	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 16:53:09.888	2025-08-22 16:53:09.888
214	RYLS234MLTTY	7caae471-702e-45ab-b47f-8b3513d25363	https://app.midtrans.com/snap/v4/redirection/7caae471-702e-45ab-b47f-8b3513d25363	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 17:03:09.958	2025-08-22 17:03:09.958
215	RYLS235HVUODGF	3bdbac62-53ae-4d81-8edc-e553ccccf0ce	https://app.midtrans.com/snap/v4/redirection/3bdbac62-53ae-4d81-8edc-e553ccccf0ce	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 17:51:23.908	2025-08-22 17:51:23.908
216	RYLS236FOCQMV	26a61ce8-6c4f-4b82-940d-fdd0eeb2a44a	https://app.midtrans.com/snap/v4/redirection/26a61ce8-6c4f-4b82-940d-fdd0eeb2a44a	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 18:10:57.725	2025-08-22 18:10:57.725
217	RYLS237HKMPBD	64c63010-6864-4270-9dfb-f7cf2022f370	https://app.midtrans.com/snap/v4/redirection/64c63010-6864-4270-9dfb-f7cf2022f370	\N	\N	244019	IDR	pending	\N	{}	{}	\N	\N	2025-08-22 20:16:51.685	2025-08-22 20:16:51.685
218	RYLS238HRDTJO	b571c85c-b866-4b23-b52d-26518631150d	https://app.midtrans.com/snap/v4/redirection/b571c85c-b866-4b23-b52d-26518631150d	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 02:22:25.807	2025-08-23 02:22:25.807
219	RYLS239YPLWEQN	a574bcc4-3727-4035-8ba9-bd3a35e88c95	https://app.midtrans.com/snap/v4/redirection/a574bcc4-3727-4035-8ba9-bd3a35e88c95	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 03:22:24.424	2025-08-23 03:22:24.424
220	RYLS240OWFXKL	3f280e00-6f01-4b2b-ac45-e279616c383f	https://app.midtrans.com/snap/v4/redirection/3f280e00-6f01-4b2b-ac45-e279616c383f	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 03:28:31.442	2025-08-23 03:28:31.442
221	RYLS241LHNJCM	3bee9a0d-0962-4c51-9455-5d649f2e6f61	https://app.midtrans.com/snap/v4/redirection/3bee9a0d-0962-4c51-9455-5d649f2e6f61	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 03:30:52.563	2025-08-23 03:30:52.563
222	RYLS242TSEZ	7de3320f-f0f6-40d6-9b26-65f354c0ee46	https://app.midtrans.com/snap/v4/redirection/7de3320f-f0f6-40d6-9b26-65f354c0ee46	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 03:48:16.757	2025-08-23 03:48:16.757
223	RYLS243MKPLCNTL	a2e4af72-e2be-4b4f-b1fe-3fab5b807eb8	https://app.midtrans.com/snap/v4/redirection/a2e4af72-e2be-4b4f-b1fe-3fab5b807eb8	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 05:07:29.262	2025-08-23 05:07:29.262
224	RYLS244LSUZXTQ	00387a5d-7a3b-4f66-9042-9c90b1994161	https://app.midtrans.com/snap/v4/redirection/00387a5d-7a3b-4f66-9042-9c90b1994161	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 05:12:03.033	2025-08-23 05:12:03.033
225	RYLS245CCZR	2f964eaa-bd33-4947-b608-a2ac4f800a91	https://app.midtrans.com/snap/v4/redirection/2f964eaa-bd33-4947-b608-a2ac4f800a91	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 05:21:24.519	2025-08-23 05:21:24.519
226	RYLS246MKXO	81b747f8-994e-4a48-9adb-f27170492e37	https://app.midtrans.com/snap/v4/redirection/81b747f8-994e-4a48-9adb-f27170492e37	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 07:01:08.591	2025-08-23 07:01:08.591
227	RYLS247OMPH	d3b326c2-e614-4d06-8cbe-e4bf1e8af280	https://app.midtrans.com/snap/v4/redirection/d3b326c2-e614-4d06-8cbe-e4bf1e8af280	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 07:29:31.267	2025-08-23 07:29:31.267
228	RYLS248PBCBJ	a297de96-8210-4363-9b4c-2c992168f1c7	https://app.midtrans.com/snap/v4/redirection/a297de96-8210-4363-9b4c-2c992168f1c7	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 08:06:29.52	2025-08-23 08:06:29.52
229	RYLS249QMRHWY	58b82073-f87c-4385-9459-59de569a7c1d	https://app.midtrans.com/snap/v4/redirection/58b82073-f87c-4385-9459-59de569a7c1d	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 08:18:09.911	2025-08-23 08:18:09.911
230	RYLS250LEOAQ	25eefaeb-9f15-4e85-bd30-b7c4eb4caa6f	https://app.midtrans.com/snap/v4/redirection/25eefaeb-9f15-4e85-bd30-b7c4eb4caa6f	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 08:34:20.999	2025-08-23 08:34:20.999
231	RYLS251JTRCM	fee8c715-495a-48ff-ad4b-7137685c197f	https://app.midtrans.com/snap/v4/redirection/fee8c715-495a-48ff-ad4b-7137685c197f	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 09:10:19.185	2025-08-23 09:10:19.185
232	RYLS252OJDZH	cae3f3fd-a27b-435c-8222-2d6fa6059c3e	https://app.midtrans.com/snap/v4/redirection/cae3f3fd-a27b-435c-8222-2d6fa6059c3e	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 10:12:16.839	2025-08-23 10:12:16.839
233	RYLS253EVVRFX	0ddaff0a-dda4-4c5f-8116-d852a0be71f0	https://app.midtrans.com/snap/v4/redirection/0ddaff0a-dda4-4c5f-8116-d852a0be71f0	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 11:57:30.94	2025-08-23 11:57:30.94
234	RYLS254ANRUKZ	c587111f-3324-482b-82ca-4a297715c263	https://app.midtrans.com/snap/v4/redirection/c587111f-3324-482b-82ca-4a297715c263	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 12:20:56.982	2025-08-23 12:20:56.982
235	RYLS255BHFXQ	3ee25ba6-f8e8-4f07-8760-2a6778b9dba1	https://app.midtrans.com/snap/v4/redirection/3ee25ba6-f8e8-4f07-8760-2a6778b9dba1	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 13:15:46.926	2025-08-23 13:15:46.926
236	RYLS256RDSN	5dcbd73c-4767-4b42-b353-cd0adf396752	https://app.midtrans.com/snap/v4/redirection/5dcbd73c-4767-4b42-b353-cd0adf396752	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 14:37:33.798	2025-08-23 14:37:33.798
237	RYLS257QHWXNS	f1bbf1b8-55e4-4cc6-a7df-2b5a4cb6d97a	https://app.midtrans.com/snap/v4/redirection/f1bbf1b8-55e4-4cc6-a7df-2b5a4cb6d97a	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 15:15:11.702	2025-08-23 15:15:11.702
238	RYLS258NTAWJ	9a6834c9-363d-4ccb-9038-7de899fe4ed7	https://app.midtrans.com/snap/v4/redirection/9a6834c9-363d-4ccb-9038-7de899fe4ed7	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 15:26:12.199	2025-08-23 15:26:12.199
239	RYLS259MAEMYLR	907567a9-384b-4d1c-b5ca-45216afb815f	https://app.midtrans.com/snap/v4/redirection/907567a9-384b-4d1c-b5ca-45216afb815f	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 16:21:24.446	2025-08-23 16:21:24.446
240	RYLS260WTBZP	7e42ab64-015c-41f9-8bf3-55c9fd39ccea	https://app.midtrans.com/snap/v4/redirection/7e42ab64-015c-41f9-8bf3-55c9fd39ccea	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 17:36:04.421	2025-08-23 17:36:04.421
241	RYLS261ILRQ	cf6f0ec2-92b3-44e4-a740-4f482e5245c1	https://app.midtrans.com/snap/v4/redirection/cf6f0ec2-92b3-44e4-a740-4f482e5245c1	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 17:36:44.631	2025-08-23 17:36:44.631
242	RYLS262ZWAU	8152da83-6b44-4e50-be80-9f9396c3831d	https://app.midtrans.com/snap/v4/redirection/8152da83-6b44-4e50-be80-9f9396c3831d	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 17:39:08.015	2025-08-23 17:39:08.015
243	RYLS263OUVYD	5d29a30d-a0d0-426f-a0eb-17c233d024a2	https://app.midtrans.com/snap/v4/redirection/5d29a30d-a0d0-426f-a0eb-17c233d024a2	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 17:51:09.759	2025-08-23 17:51:09.759
244	RYLS264RNJXTL	c42e409a-ea96-49b9-ae29-dc0b67f97e68	https://app.midtrans.com/snap/v4/redirection/c42e409a-ea96-49b9-ae29-dc0b67f97e68	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 18:16:24.448	2025-08-23 18:16:24.448
245	RYLS265OOKPEQ	9b52235a-915e-4f36-9b7b-75dbaa898f90	https://app.midtrans.com/snap/v4/redirection/9b52235a-915e-4f36-9b7b-75dbaa898f90	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 18:56:35.203	2025-08-23 18:56:35.203
246	RYLS266ZATUA	112e33e8-b017-48a4-9d5b-9ae0dba63baf	https://app.midtrans.com/snap/v4/redirection/112e33e8-b017-48a4-9d5b-9ae0dba63baf	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 18:57:13.018	2025-08-23 18:57:13.018
247	RYLS267TELFBXZ	0a5dec3f-dc5f-491c-87ec-d261cb6fb238	https://app.midtrans.com/snap/v4/redirection/0a5dec3f-dc5f-491c-87ec-d261cb6fb238	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 19:47:34.338	2025-08-23 19:47:34.338
248	RYLS268TITOD	648b0dca-d2a9-4656-9d7c-7d6e78719988	https://app.midtrans.com/snap/v4/redirection/648b0dca-d2a9-4656-9d7c-7d6e78719988	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 21:43:29.189	2025-08-23 21:43:29.189
249	RYLS269DXEIGM	267f51a2-494b-405f-9c40-3614e2873475	https://app.midtrans.com/snap/v4/redirection/267f51a2-494b-405f-9c40-3614e2873475	\N	\N	244802	IDR	pending	\N	{}	{}	\N	\N	2025-08-23 22:29:09.563	2025-08-23 22:29:09.563
250	RYLS270DLLKAN	35608ce8-eef1-44e0-96b5-5bca40b97221	https://app.midtrans.com/snap/v4/redirection/35608ce8-eef1-44e0-96b5-5bca40b97221	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 01:22:41.533	2025-08-24 01:22:41.533
251	RYLS271NBVARGRC	f3013381-0bbf-4afa-99b9-d37737b64cf0	https://app.midtrans.com/snap/v4/redirection/f3013381-0bbf-4afa-99b9-d37737b64cf0	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 02:33:39.478	2025-08-24 02:33:39.478
252	RYLS272JFNPHM	5a8cdde7-8867-43f9-b9cd-de6e9aefebf9	https://app.midtrans.com/snap/v4/redirection/5a8cdde7-8867-43f9-b9cd-de6e9aefebf9	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 03:00:12.473	2025-08-24 03:00:12.473
253	RYLS273ADYPUHF	1e980b19-9bd3-4081-bcda-bf8617a64f0d	https://app.midtrans.com/snap/v4/redirection/1e980b19-9bd3-4081-bcda-bf8617a64f0d	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 03:20:57.905	2025-08-24 03:20:57.905
254	RYLS275JFSXFOG	67e66343-bd4b-456e-b6f6-24f3500ad43b	https://app.midtrans.com/snap/v4/redirection/67e66343-bd4b-456e-b6f6-24f3500ad43b	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 04:25:02.339	2025-08-24 04:25:02.339
255	RYLS276UACZXY	bf0837e7-9366-4a33-b80a-79d5224014a5	https://app.midtrans.com/snap/v4/redirection/bf0837e7-9366-4a33-b80a-79d5224014a5	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 07:24:30.504	2025-08-24 07:24:30.504
256	RYLS277WXOQCE	45010d14-1299-43f1-9abb-c0cb2359f28f	https://app.midtrans.com/snap/v4/redirection/45010d14-1299-43f1-9abb-c0cb2359f28f	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 07:41:22.378	2025-08-24 07:41:22.378
257	RYLS278LLMXBXM	d35ba52c-3817-4068-b170-9f07533b999d	https://app.midtrans.com/snap/v4/redirection/d35ba52c-3817-4068-b170-9f07533b999d	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 07:46:23.811	2025-08-24 07:46:23.811
258	RYLS279XTHNNFQ	cff0e6d9-4ac5-42f3-bc01-ea6ba5401095	https://app.midtrans.com/snap/v4/redirection/cff0e6d9-4ac5-42f3-bc01-ea6ba5401095	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 07:46:55.674	2025-08-24 07:46:55.674
259	RYLS280XKNWEEG	83274258-aa3b-46e0-8b5b-5df8279b5fe5	https://app.midtrans.com/snap/v4/redirection/83274258-aa3b-46e0-8b5b-5df8279b5fe5	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 07:48:24.673	2025-08-24 07:48:24.673
260	RYLS281YRJCCBO	0dea0e49-2da9-461f-b5f5-95b60d06a17b	https://app.midtrans.com/snap/v4/redirection/0dea0e49-2da9-461f-b5f5-95b60d06a17b	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 07:48:52.969	2025-08-24 07:48:52.969
261	RYLS282JBIUUJG	b46f9c25-d12c-4a87-b383-600746b2ca42	https://app.midtrans.com/snap/v4/redirection/b46f9c25-d12c-4a87-b383-600746b2ca42	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 10:24:31.753	2025-08-24 10:24:31.753
262	RYLS283DYAMR	519bb9ff-a4ea-4cfc-b752-48fb8bb6dcee	https://app.midtrans.com/snap/v4/redirection/519bb9ff-a4ea-4cfc-b752-48fb8bb6dcee	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 12:02:35.515	2025-08-24 12:02:35.515
263	RYLS284XVVUVPS	2f851728-0022-4a2c-9d16-5cdf0a365ebd	https://app.midtrans.com/snap/v4/redirection/2f851728-0022-4a2c-9d16-5cdf0a365ebd	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 12:22:07.592	2025-08-24 12:22:07.592
264	RYLS285WOBPR	3d6a9c02-7d4e-4007-b919-79be81b64558	https://app.midtrans.com/snap/v4/redirection/3d6a9c02-7d4e-4007-b919-79be81b64558	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 13:27:52.151	2025-08-24 13:27:52.151
265	RYLS286BQGNUEF	5c284455-251c-4002-bfd2-7782d8fb0d34	https://app.midtrans.com/snap/v4/redirection/5c284455-251c-4002-bfd2-7782d8fb0d34	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 14:39:47.694	2025-08-24 14:39:47.694
266	RYLS287EOPLB	dfebd46b-7f96-4c92-b56b-ab87f9c1dad3	https://app.midtrans.com/snap/v4/redirection/dfebd46b-7f96-4c92-b56b-ab87f9c1dad3	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 14:50:48.955	2025-08-24 14:50:48.955
267	RYLS288QFOY	efc00af7-71d7-448d-8f95-9e665abe6d1c	https://app.midtrans.com/snap/v4/redirection/efc00af7-71d7-448d-8f95-9e665abe6d1c	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 14:51:08.971	2025-08-24 14:51:08.971
268	RYLS289YLMDWLD	fea1eae5-48c8-4f71-8426-cb2002ce9eea	https://app.midtrans.com/snap/v4/redirection/fea1eae5-48c8-4f71-8426-cb2002ce9eea	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 14:54:25.203	2025-08-24 14:54:25.203
269	RYLS290YIZSIL	eabf6256-ae35-4c3d-8b2b-d3572e94539f	https://app.midtrans.com/snap/v4/redirection/eabf6256-ae35-4c3d-8b2b-d3572e94539f	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 14:54:46.438	2025-08-24 14:54:46.438
270	RYLS291LLRTQ	eadeb183-cbb8-46fd-9c0c-f5629a2cefc4	https://app.midtrans.com/snap/v4/redirection/eadeb183-cbb8-46fd-9c0c-f5629a2cefc4	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 14:56:38.855	2025-08-24 14:56:38.855
271	RYLS292JRYBDZQ	d48ee01d-cdbf-48d7-aa9a-abd4885b70f6	https://app.midtrans.com/snap/v4/redirection/d48ee01d-cdbf-48d7-aa9a-abd4885b70f6	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 14:56:55.938	2025-08-24 14:56:55.938
272	RYLS293JFNCD	f372da60-cd95-4168-a534-811e577cc092	https://app.midtrans.com/snap/v4/redirection/f372da60-cd95-4168-a534-811e577cc092	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 15:03:42.385	2025-08-24 15:03:42.385
273	RYLS294XCBECDY	08b42c4f-285e-473a-aef6-663caee5d2c0	https://app.midtrans.com/snap/v4/redirection/08b42c4f-285e-473a-aef6-663caee5d2c0	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 15:09:32.362	2025-08-24 15:09:32.362
274	RYLS295MFKCL	a01fd999-5cf3-4555-bf7d-078690112275	https://app.midtrans.com/snap/v4/redirection/a01fd999-5cf3-4555-bf7d-078690112275	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 16:32:27.344	2025-08-24 16:32:27.344
275	RYLS296ZWO	d1a73f9c-df16-4765-a580-e415e26e8901	https://app.midtrans.com/snap/v4/redirection/d1a73f9c-df16-4765-a580-e415e26e8901	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 17:19:33.103	2025-08-24 17:19:33.103
276	RYLS297TPCXQ	ab671bd5-0739-4848-9c47-8771672ba9e0	https://app.midtrans.com/snap/v4/redirection/ab671bd5-0739-4848-9c47-8771672ba9e0	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 20:20:17.529	2025-08-24 20:20:17.529
277	RYLS298CVUNN	00d92795-dc8a-46ee-9071-11affbab583c	https://app.midtrans.com/snap/v4/redirection/00d92795-dc8a-46ee-9071-11affbab583c	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 20:44:13.543	2025-08-24 20:44:13.543
278	RYLS299ARGAZX	121ccb7b-21d7-496f-8897-c677683ff23c	https://app.midtrans.com/snap/v4/redirection/121ccb7b-21d7-496f-8897-c677683ff23c	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 21:27:01.056	2025-08-24 21:27:01.056
279	RYLS300DJMMA	7a7a1ebf-4397-4a96-af7c-8a1e24ea1913	https://app.midtrans.com/snap/v4/redirection/7a7a1ebf-4397-4a96-af7c-8a1e24ea1913	\N	\N	244689	IDR	pending	\N	{}	{}	\N	\N	2025-08-24 23:42:34.032	2025-08-24 23:42:34.032
280	RYLS301YZDRMZ	1ead3f0c-92f2-4a06-a412-aa97a7892309	https://app.midtrans.com/snap/v4/redirection/1ead3f0c-92f2-4a06-a412-aa97a7892309	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 01:50:03.882	2025-08-25 01:50:03.882
281	RYLS302BJWAR	d8b8f0de-0255-49ab-8ea5-d6a4aae3350d	https://app.midtrans.com/snap/v4/redirection/d8b8f0de-0255-49ab-8ea5-d6a4aae3350d	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 03:33:22.866	2025-08-25 03:33:22.866
282	RYLS303NREPGTD	a52ba678-f554-4805-a927-42ad0ae99f40	https://app.midtrans.com/snap/v4/redirection/a52ba678-f554-4805-a927-42ad0ae99f40	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 05:09:31.48	2025-08-25 05:09:31.48
283	RYLS304TMHC	b592b2eb-4c1d-4f3c-8190-b99c1a707f7b	https://app.midtrans.com/snap/v4/redirection/b592b2eb-4c1d-4f3c-8190-b99c1a707f7b	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 05:19:48.727	2025-08-25 05:19:48.727
284	RYLS305EHKBZD	86129592-0575-4eda-a6f8-4d682abb5321	https://app.midtrans.com/snap/v4/redirection/86129592-0575-4eda-a6f8-4d682abb5321	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 05:41:27.421	2025-08-25 05:41:27.421
285	RYLS306GUEUHN	70c0560a-95a8-448e-aa12-dd550c6859be	https://app.midtrans.com/snap/v4/redirection/70c0560a-95a8-448e-aa12-dd550c6859be	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 05:42:47.888	2025-08-25 05:42:47.888
286	RYLS307BLRCXX	1dd3352a-f187-4a65-bc9f-a27d232a73b5	https://app.midtrans.com/snap/v4/redirection/1dd3352a-f187-4a65-bc9f-a27d232a73b5	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 05:43:30.754	2025-08-25 05:43:30.754
287	RYLS308NHYDIVPE	64529cae-e4c8-4cf2-944b-bb4de3e5bd76	https://app.midtrans.com/snap/v4/redirection/64529cae-e4c8-4cf2-944b-bb4de3e5bd76	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 05:44:14.259	2025-08-25 05:44:14.259
288	RYLS309PIJKT	d7fc1b89-4bb7-4a59-842a-51745c7ae9ed	https://app.midtrans.com/snap/v4/redirection/d7fc1b89-4bb7-4a59-842a-51745c7ae9ed	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 07:47:27.654	2025-08-25 07:47:27.654
289	RYLS310HBCHMSOL	d592a9a5-9e8e-4f3e-80b7-5b421276a7a5	https://app.midtrans.com/snap/v4/redirection/d592a9a5-9e8e-4f3e-80b7-5b421276a7a5	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 08:20:03.89	2025-08-25 08:20:03.89
290	RYLS311RQMB	d93cc223-f7fb-46de-9839-03937bed9420	https://app.midtrans.com/snap/v4/redirection/d93cc223-f7fb-46de-9839-03937bed9420	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 10:48:02.99	2025-08-25 10:48:02.99
291	RYLS313CHNOF	605cca2a-9d4a-449c-9da5-63cc7fa4185f	https://app.midtrans.com/snap/v4/redirection/605cca2a-9d4a-449c-9da5-63cc7fa4185f	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 12:02:06.156	2025-08-25 12:02:06.156
292	RYLS314MRJM	f2afc89c-331d-4e93-85f5-e7679618afef	https://app.midtrans.com/snap/v4/redirection/f2afc89c-331d-4e93-85f5-e7679618afef	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 14:38:58.77	2025-08-25 14:38:58.77
293	RYLS315MGVOER	a70528c0-9fcf-4d5f-999d-0e000e57455c	https://app.midtrans.com/snap/v4/redirection/a70528c0-9fcf-4d5f-999d-0e000e57455c	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 17:42:43.617	2025-08-25 17:42:43.617
294	RYLS316JZLF	fc756c81-0045-404d-afd3-1f82378c85a2	https://app.midtrans.com/snap/v4/redirection/fc756c81-0045-404d-afd3-1f82378c85a2	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 17:48:53.522	2025-08-25 17:48:53.522
295	RYLS317WNV	18941486-653e-4c9f-b8c5-a42771b873cc	https://app.midtrans.com/snap/v4/redirection/18941486-653e-4c9f-b8c5-a42771b873cc	\N	\N	244985	IDR	pending	\N	{}	{}	\N	\N	2025-08-25 23:56:28.981	2025-08-25 23:56:28.981
296	RYLS318XTTESCH	7bed9208-e731-4722-9672-12ab625a4ab6	https://app.midtrans.com/snap/v4/redirection/7bed9208-e731-4722-9672-12ab625a4ab6	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 00:13:44.731	2025-08-26 00:13:44.731
297	RYLS319QYNBG	f6141001-bb83-431e-9284-7f973627e542	https://app.midtrans.com/snap/v4/redirection/f6141001-bb83-431e-9284-7f973627e542	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 01:24:46.771	2025-08-26 01:24:46.771
298	RYLS320MSHGLG	10337aa5-79b0-4017-91c2-d58262368eeb	https://app.midtrans.com/snap/v4/redirection/10337aa5-79b0-4017-91c2-d58262368eeb	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 01:44:53.56	2025-08-26 01:44:53.56
299	RYLS321EJJGEOX	ab910795-eb31-4469-8598-12da8360316a	https://app.midtrans.com/snap/v4/redirection/ab910795-eb31-4469-8598-12da8360316a	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 01:52:45.396	2025-08-26 01:52:45.396
300	RYLS322BGSDMNV	619931d7-bd36-4863-9cda-324444b9b5e1	https://app.midtrans.com/snap/v4/redirection/619931d7-bd36-4863-9cda-324444b9b5e1	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 02:09:11.449	2025-08-26 02:09:11.449
301	RYLS323RJEW	c15c77bf-8d39-404b-a2e3-63e29de114dd	https://app.midtrans.com/snap/v4/redirection/c15c77bf-8d39-404b-a2e3-63e29de114dd	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 02:18:34.731	2025-08-26 02:18:34.731
302	RYLS324GWQQBK	2065c8b1-2e4e-414d-9f1e-f23bb95d406c	https://app.midtrans.com/snap/v4/redirection/2065c8b1-2e4e-414d-9f1e-f23bb95d406c	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 02:20:54.264	2025-08-26 02:20:54.264
303	RYLS325EGQO	676181ff-2c81-440a-994f-7a3e29aebdd5	https://app.midtrans.com/snap/v4/redirection/676181ff-2c81-440a-994f-7a3e29aebdd5	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 02:26:58.561	2025-08-26 02:26:58.561
304	RYLS327VJDBES	b5c9f641-3810-48e2-aad3-606af20a4815	https://app.midtrans.com/snap/v4/redirection/b5c9f641-3810-48e2-aad3-606af20a4815	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 03:10:45.175	2025-08-26 03:10:45.175
305	RYLS328UWPHKL	45278e25-bd45-4123-a9be-2f14c11c0782	https://app.midtrans.com/snap/v4/redirection/45278e25-bd45-4123-a9be-2f14c11c0782	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 03:39:22.834	2025-08-26 03:39:22.834
306	RYLS329RWWXTY	21d0cd59-4387-4149-a0d2-517413c35f73	https://app.midtrans.com/snap/v4/redirection/21d0cd59-4387-4149-a0d2-517413c35f73	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 04:54:52.843	2025-08-26 04:54:52.843
307	RYLS330BXZZELWP	928a3dce-f3cd-47c5-b192-1e190ff96b17	https://app.midtrans.com/snap/v4/redirection/928a3dce-f3cd-47c5-b192-1e190ff96b17	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 04:55:24.038	2025-08-26 04:55:24.038
308	RYLS331LTVLTD	b80f9352-a845-4424-aa8c-b5bca5ba4ed2	https://app.midtrans.com/snap/v4/redirection/b80f9352-a845-4424-aa8c-b5bca5ba4ed2	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 05:02:33.263	2025-08-26 05:02:33.263
309	RYLS332MJZLIK	e6a100ef-a44f-4f97-93ce-bb254f41bbc4	https://app.midtrans.com/snap/v4/redirection/e6a100ef-a44f-4f97-93ce-bb254f41bbc4	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 05:02:35.928	2025-08-26 05:02:35.928
310	RYLS333MZUESO	9a4a5a25-5a9b-41ff-ae72-237c895bc76a	https://app.midtrans.com/snap/v4/redirection/9a4a5a25-5a9b-41ff-ae72-237c895bc76a	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 05:03:25.844	2025-08-26 05:03:25.844
311	RYLS334RLNV	33311396-c603-443c-a8e8-73ea5b992b5c	https://app.midtrans.com/snap/v4/redirection/33311396-c603-443c-a8e8-73ea5b992b5c	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 05:54:50.208	2025-08-26 05:54:50.208
312	RYLS335UGOEK	08b8ff2f-0e12-4f4b-8e4e-701a2d42b7df	https://app.midtrans.com/snap/v4/redirection/08b8ff2f-0e12-4f4b-8e4e-701a2d42b7df	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 06:34:34.206	2025-08-26 06:34:34.206
313	RYLS337FPCBOU	7c306b8c-9772-4feb-8868-210560259cf3	https://app.midtrans.com/snap/v4/redirection/7c306b8c-9772-4feb-8868-210560259cf3	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 07:23:29.489	2025-08-26 07:23:29.489
314	RYLS338XJHZFM	b49aa0d6-13e2-471c-9a94-76d571187f60	https://app.midtrans.com/snap/v4/redirection/b49aa0d6-13e2-471c-9a94-76d571187f60	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 07:33:44.147	2025-08-26 07:33:44.147
315	RYLS339TULGLC	78cdbabe-5191-4508-b67b-a0bf7a3294a6	https://app.midtrans.com/snap/v4/redirection/78cdbabe-5191-4508-b67b-a0bf7a3294a6	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 07:58:15.426	2025-08-26 07:58:15.426
316	RYLS340EKTONV	70fb3fdb-33c9-4795-80b6-a1669ce69946	https://app.midtrans.com/snap/v4/redirection/70fb3fdb-33c9-4795-80b6-a1669ce69946	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 07:59:11.776	2025-08-26 07:59:11.776
317	RYLS341BEQZPC	ead8cbf1-c77b-4e50-b31d-dfca60d239a2	https://app.midtrans.com/snap/v4/redirection/ead8cbf1-c77b-4e50-b31d-dfca60d239a2	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 07:59:26.675	2025-08-26 07:59:26.675
318	RYLS342SMR	84d043fa-fd66-4850-8259-d43a679d8ce2	https://app.midtrans.com/snap/v4/redirection/84d043fa-fd66-4850-8259-d43a679d8ce2	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 08:01:03.028	2025-08-26 08:01:03.028
319	RYLS343DPBUAB	ffbd7550-4ce2-4a8a-9c46-5d85a28cdc8f	https://app.midtrans.com/snap/v4/redirection/ffbd7550-4ce2-4a8a-9c46-5d85a28cdc8f	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 08:22:34.93	2025-08-26 08:22:34.93
320	RYLS344OHBVP	75d96c88-6c47-4796-a907-10ff298433f7	https://app.midtrans.com/snap/v4/redirection/75d96c88-6c47-4796-a907-10ff298433f7	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 08:43:58.13	2025-08-26 08:43:58.13
321	RYLS345SIZJ	4113ebbb-f999-482c-932f-13c5e93fc45e	https://app.midtrans.com/snap/v4/redirection/4113ebbb-f999-482c-932f-13c5e93fc45e	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 09:06:10.364	2025-08-26 09:06:10.364
322	RYLS346UDUSMBIE	ceddc81f-ad72-443f-b55a-1eec83502116	https://app.midtrans.com/snap/v4/redirection/ceddc81f-ad72-443f-b55a-1eec83502116	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 09:25:32.179	2025-08-26 09:25:32.179
323	RYLS347AUUBX	fcbddc00-1647-4cda-86ff-e13ca5d6b2bc	https://app.midtrans.com/snap/v4/redirection/fcbddc00-1647-4cda-86ff-e13ca5d6b2bc	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 09:36:28.514	2025-08-26 09:36:28.514
324	RYLS348XHYP	c501d5d3-e49f-410c-888a-e8e35b68ebd0	https://app.midtrans.com/snap/v4/redirection/c501d5d3-e49f-410c-888a-e8e35b68ebd0	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 10:16:21.567	2025-08-26 10:16:21.567
325	RYLS349TBJX	9ac4836b-73d1-4b3e-b002-32ef50470364	https://app.midtrans.com/snap/v4/redirection/9ac4836b-73d1-4b3e-b002-32ef50470364	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 10:23:39.217	2025-08-26 10:23:39.217
326	RYLS350OFWYT	db198773-3497-4415-80d1-5ff474212b56	https://app.midtrans.com/snap/v4/redirection/db198773-3497-4415-80d1-5ff474212b56	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 10:46:44.101	2025-08-26 10:46:44.101
327	RYLS351WWHH	b902d9b4-ee59-4f1f-81b4-4cd3b8935421	https://app.midtrans.com/snap/v4/redirection/b902d9b4-ee59-4f1f-81b4-4cd3b8935421	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 13:07:33.379	2025-08-26 13:07:33.379
328	RYLS352EDZQSO	c5f2d878-c271-46f4-ba22-3b57853f8782	https://app.midtrans.com/snap/v4/redirection/c5f2d878-c271-46f4-ba22-3b57853f8782	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 13:10:08.081	2025-08-26 13:10:08.081
329	RYLS353OKJHU	25e56373-342d-405f-b969-79d1e0fd3861	https://app.midtrans.com/snap/v4/redirection/25e56373-342d-405f-b969-79d1e0fd3861	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 14:08:48.798	2025-08-26 14:08:48.798
330	RYLS354MPRX	698c2eeb-2799-461d-a73d-8d882b33b988	https://app.midtrans.com/snap/v4/redirection/698c2eeb-2799-461d-a73d-8d882b33b988	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 14:27:51.946	2025-08-26 14:27:51.946
331	RYLS355WKBNYEV	6e793ba8-e06e-4c05-b61d-bcccc4bfb32a	https://app.midtrans.com/snap/v4/redirection/6e793ba8-e06e-4c05-b61d-bcccc4bfb32a	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 14:57:19.63	2025-08-26 14:57:19.63
332	RYLS356OWXMK	41aa67af-7f61-4877-9b94-f3514ee505bd	https://app.midtrans.com/snap/v4/redirection/41aa67af-7f61-4877-9b94-f3514ee505bd	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 15:03:32.855	2025-08-26 15:03:32.855
333	RYLS358SZZEO	08ae1fa1-0b87-4cfb-84ee-3454fa5ee5cc	https://app.midtrans.com/snap/v4/redirection/08ae1fa1-0b87-4cfb-84ee-3454fa5ee5cc	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 15:21:38.048	2025-08-26 15:21:38.048
334	RYLS359UXEXAA	373745fe-d1d8-4848-b1a9-26c0aab6ba06	https://app.midtrans.com/snap/v4/redirection/373745fe-d1d8-4848-b1a9-26c0aab6ba06	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 15:26:29.829	2025-08-26 15:26:29.829
335	RYLS360APWGX	38703a40-9066-423b-8ce0-f6baa93e549e	https://app.midtrans.com/snap/v4/redirection/38703a40-9066-423b-8ce0-f6baa93e549e	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 15:32:16.714	2025-08-26 15:32:16.714
336	RYLS361IYDHLLMN	6b07e601-2d0c-4f76-941f-f4237fe5d68d	https://app.midtrans.com/snap/v4/redirection/6b07e601-2d0c-4f76-941f-f4237fe5d68d	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 16:55:42.105	2025-08-26 16:55:42.105
337	RYLS362TQNCO	468ec8ea-ad05-4520-833b-76a8bfc58536	https://app.midtrans.com/snap/v4/redirection/468ec8ea-ad05-4520-833b-76a8bfc58536	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 16:59:04.329	2025-08-26 16:59:04.329
338	RYLS363KGSHK	766e5e9a-1dd4-44c3-979e-65948444b0e1	https://app.midtrans.com/snap/v4/redirection/766e5e9a-1dd4-44c3-979e-65948444b0e1	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 19:11:49.089	2025-08-26 19:11:49.089
339	RYLS364HOCH	a71a997b-9e39-4123-95e1-b09f44647865	https://app.midtrans.com/snap/v4/redirection/a71a997b-9e39-4123-95e1-b09f44647865	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 20:57:16.632	2025-08-26 20:57:16.632
340	RYLS365JLTT	7652ded4-4910-4c95-afd6-1f81efc81123	https://app.midtrans.com/snap/v4/redirection/7652ded4-4910-4c95-afd6-1f81efc81123	\N	\N	243531	IDR	pending	\N	{}	{}	\N	\N	2025-08-26 23:28:58.149	2025-08-26 23:28:58.149
341	RYLS366AMUM	72ab682d-6903-49ca-b174-0895a112dacc	https://app.midtrans.com/snap/v4/redirection/72ab682d-6903-49ca-b174-0895a112dacc	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 02:27:08.305	2025-08-27 02:27:08.305
342	RYLS367UXFJSY	a515a67f-439e-4952-8349-ac7f4f57db83	https://app.midtrans.com/snap/v4/redirection/a515a67f-439e-4952-8349-ac7f4f57db83	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 02:51:57.159	2025-08-27 02:51:57.159
343	RYLS368KFMAAY	d3abcfc0-5d4c-48fd-a302-6f2e8dbeba81	https://app.midtrans.com/snap/v4/redirection/d3abcfc0-5d4c-48fd-a302-6f2e8dbeba81	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 02:56:24.821	2025-08-27 02:56:24.821
344	RYLS369XETLEC	11b0dffd-0c6c-4274-b360-5b06e66e32c6	https://app.midtrans.com/snap/v4/redirection/11b0dffd-0c6c-4274-b360-5b06e66e32c6	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 03:50:22.882	2025-08-27 03:50:22.882
345	RYLS370ZJCQSRO	ed3ca03e-2df0-4c4b-af53-e5136ac876e9	https://app.midtrans.com/snap/v4/redirection/ed3ca03e-2df0-4c4b-af53-e5136ac876e9	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 05:51:40.407	2025-08-27 05:51:40.407
346	RYLS371QOXKO	be075a98-3134-4b76-93c7-cca915abe09e	https://app.midtrans.com/snap/v4/redirection/be075a98-3134-4b76-93c7-cca915abe09e	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 05:53:32.935	2025-08-27 05:53:32.935
347	RYLS372IRACGPOC	b40cf3fa-536c-46de-ae61-b9eef6d31591	https://app.midtrans.com/snap/v4/redirection/b40cf3fa-536c-46de-ae61-b9eef6d31591	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 05:54:43.087	2025-08-27 05:54:43.087
348	RYLS373KPKEFV	760f1497-268b-4f62-bad6-f9c2a128d5a8	https://app.midtrans.com/snap/v4/redirection/760f1497-268b-4f62-bad6-f9c2a128d5a8	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 05:54:45.566	2025-08-27 05:54:45.566
349	RYLS374WLA	38aa0e91-c5a4-47ac-8ad1-81b844ed420b	https://app.midtrans.com/snap/v4/redirection/38aa0e91-c5a4-47ac-8ad1-81b844ed420b	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 05:55:01.983	2025-08-27 05:55:01.983
350	RYLS375GHVDB	d251c7a6-516c-4eca-adf5-c9ffc1348517	https://app.midtrans.com/snap/v4/redirection/d251c7a6-516c-4eca-adf5-c9ffc1348517	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 05:55:47.284	2025-08-27 05:55:47.284
351	RYLS376AORH	474c19fb-380e-4653-ac35-9095ac82ecfc	https://app.midtrans.com/snap/v4/redirection/474c19fb-380e-4653-ac35-9095ac82ecfc	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 05:59:30.247	2025-08-27 05:59:30.247
352	RYLS377PWSHRS	2d2479f4-ff2b-439e-96b5-c2a4edbae975	https://app.midtrans.com/snap/v4/redirection/2d2479f4-ff2b-439e-96b5-c2a4edbae975	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 06:04:49.921	2025-08-27 06:04:49.921
353	RYLS378EPFNDYXV	4e2d9e02-8a29-4c57-a821-384fa3228495	https://app.midtrans.com/snap/v4/redirection/4e2d9e02-8a29-4c57-a821-384fa3228495	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 06:11:22.428	2025-08-27 06:11:22.428
354	RYLS379SRQXEG	e702b62a-19f3-4bac-bb19-99868ed44192	https://app.midtrans.com/snap/v4/redirection/e702b62a-19f3-4bac-bb19-99868ed44192	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 06:11:33.315	2025-08-27 06:11:33.315
355	RYLS380GTWOJXRA	b96b8b25-102a-4fab-b91a-2658d75f2538	https://app.midtrans.com/snap/v4/redirection/b96b8b25-102a-4fab-b91a-2658d75f2538	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 06:14:06.555	2025-08-27 06:14:06.555
356	RYLS381WJUABD	8eb974a3-2dc1-4982-a819-4180f2971d97	https://app.midtrans.com/snap/v4/redirection/8eb974a3-2dc1-4982-a819-4180f2971d97	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 06:15:01.015	2025-08-27 06:15:01.015
357	RYLS382FRGAM	97095d14-9f68-495e-bd7a-f32c3fa0f858	https://app.midtrans.com/snap/v4/redirection/97095d14-9f68-495e-bd7a-f32c3fa0f858	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 06:17:00.121	2025-08-27 06:17:00.121
358	RYLS383CFDAMA	e55da0ee-7b89-49b2-a7a3-0b51aa6802ae	https://app.midtrans.com/snap/v4/redirection/e55da0ee-7b89-49b2-a7a3-0b51aa6802ae	\N	\N	12193602	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 06:19:19.464	2025-08-27 06:19:19.464
359	RYLS384RLN	756cbeb3-fca8-49ba-94b7-89c2f6c7f5ef	https://app.midtrans.com/snap/v4/redirection/756cbeb3-fca8-49ba-94b7-89c2f6c7f5ef	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 06:23:31.547	2025-08-27 06:23:31.547
360	RYLS385PHIXAH	853cbee0-b7fc-452b-90cc-71ecd3178650	https://app.midtrans.com/snap/v4/redirection/853cbee0-b7fc-452b-90cc-71ecd3178650	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 06:24:28.999	2025-08-27 06:24:28.999
361	RYLS386UFJFJKY	76514894-eb53-477d-b6cc-12d188a0866b	https://app.midtrans.com/snap/v4/redirection/76514894-eb53-477d-b6cc-12d188a0866b	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 06:25:39.129	2025-08-27 06:25:39.129
362	RYLS387CJAWQZ	be07cefc-2472-47d7-bbe5-abe70f8847a6	https://app.midtrans.com/snap/v4/redirection/be07cefc-2472-47d7-bbe5-abe70f8847a6	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 06:25:54.813	2025-08-27 06:25:54.813
363	RYLS388ODJBY	fd1bb0ef-41d0-46d3-99ca-7554ea03a5c4	https://app.midtrans.com/snap/v4/redirection/fd1bb0ef-41d0-46d3-99ca-7554ea03a5c4	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 06:30:15.517	2025-08-27 06:30:15.517
364	RYLS389VZWX	f656fa30-57fb-4fb4-83ec-22de217efce9	https://app.midtrans.com/snap/v4/redirection/f656fa30-57fb-4fb4-83ec-22de217efce9	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 06:50:58.161	2025-08-27 06:50:58.161
365	RYLS390KYNFUWZ	1467b272-29a2-4af1-89e6-8d67e7169694	https://app.midtrans.com/snap/v4/redirection/1467b272-29a2-4af1-89e6-8d67e7169694	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 06:57:37.62	2025-08-27 06:57:37.62
366	RYLS391FLTRI	b5e84f7b-9a7f-4ce0-b7f4-f3fb7e7f9a1a	https://app.midtrans.com/snap/v4/redirection/b5e84f7b-9a7f-4ce0-b7f4-f3fb7e7f9a1a	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 06:59:04.173	2025-08-27 06:59:04.173
367	RYLS392QXDPR	799afa48-5955-4714-9e10-dab3a0a94439	https://app.midtrans.com/snap/v4/redirection/799afa48-5955-4714-9e10-dab3a0a94439	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 07:15:06.852	2025-08-27 07:15:06.852
368	RYLS393FJJPN	4df3431e-4311-446d-ad14-2aa2ebbaa34b	https://app.midtrans.com/snap/v4/redirection/4df3431e-4311-446d-ad14-2aa2ebbaa34b	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 07:27:42.464	2025-08-27 07:27:42.464
369	RYLS394XUESU	1b0980b1-0052-4586-b0c0-f4dc534bad62	https://app.midtrans.com/snap/v4/redirection/1b0980b1-0052-4586-b0c0-f4dc534bad62	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 07:28:34.584	2025-08-27 07:28:34.584
370	RYLS395AXSY	4a3df2d0-baf5-4dae-bdc4-47a6c824588f	https://app.midtrans.com/snap/v4/redirection/4a3df2d0-baf5-4dae-bdc4-47a6c824588f	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 07:36:13.984	2025-08-27 07:36:13.984
371	RYLS396LQZDA	c73866fd-74ce-4b8a-b580-2fa802d724b1	https://app.midtrans.com/snap/v4/redirection/c73866fd-74ce-4b8a-b580-2fa802d724b1	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 07:37:30.445	2025-08-27 07:37:30.445
372	RYLS397OHWLQV	e6aee9f0-dcbc-4047-8a13-59b9c9b3050e	https://app.midtrans.com/snap/v4/redirection/e6aee9f0-dcbc-4047-8a13-59b9c9b3050e	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 07:48:32.737	2025-08-27 07:48:32.737
373	RYLS400LZZND	dc20b8cf-4afb-4768-ad55-50474f76488b	https://app.midtrans.com/snap/v4/redirection/dc20b8cf-4afb-4768-ad55-50474f76488b	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 08:24:31.437	2025-08-27 08:24:31.437
374	RYLS401AOTATX	7f84a79b-1ecc-455e-8628-6179e2be6708	https://app.midtrans.com/snap/v4/redirection/7f84a79b-1ecc-455e-8628-6179e2be6708	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 08:48:36.986	2025-08-27 08:48:36.986
375	RYLS402FCNKOG	c492c1f2-5680-4071-9bce-ec7317258da5	https://app.midtrans.com/snap/v4/redirection/c492c1f2-5680-4071-9bce-ec7317258da5	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 09:29:50.682	2025-08-27 09:29:50.682
376	RYLS404HAXIKPK	0bab2cb9-8b7c-4452-9537-0d9a9da6045e	https://app.midtrans.com/snap/v4/redirection/0bab2cb9-8b7c-4452-9537-0d9a9da6045e	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 09:41:44.679	2025-08-27 09:41:44.679
377	RYLS405DGWIQXX	18a92bd3-390b-4135-aa84-9ce9943b0b62	https://app.midtrans.com/snap/v4/redirection/18a92bd3-390b-4135-aa84-9ce9943b0b62	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 09:43:36.172	2025-08-27 09:43:36.172
378	RYLS406XCLUMZ	bb30aa89-7c6f-4c25-a6d9-98431032252b	https://app.midtrans.com/snap/v4/redirection/bb30aa89-7c6f-4c25-a6d9-98431032252b	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 09:43:36.683	2025-08-27 09:43:36.683
379	RYLS407LGOYF	c80ddc02-1529-4c5f-a1c7-7fca1728f242	https://app.midtrans.com/snap/v4/redirection/c80ddc02-1529-4c5f-a1c7-7fca1728f242	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 09:45:43.783	2025-08-27 09:45:43.783
380	RYLS408LLMIT	0af8e74d-4ead-44d5-9deb-67c090c55cb9	https://app.midtrans.com/snap/v4/redirection/0af8e74d-4ead-44d5-9deb-67c090c55cb9	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 09:52:02.266	2025-08-27 09:52:02.266
381	RYLS409TJVO	bd3fb221-96fd-4e46-a21a-715bda38d027	https://app.midtrans.com/snap/v4/redirection/bd3fb221-96fd-4e46-a21a-715bda38d027	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 09:54:55.033	2025-08-27 09:54:55.033
382	RYLS410YQTM	95b2e61d-fe31-4072-a0f9-8d4b2d99ba3b	https://app.midtrans.com/snap/v4/redirection/95b2e61d-fe31-4072-a0f9-8d4b2d99ba3b	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 09:55:48.425	2025-08-27 09:55:48.425
383	RYLS411QFGWJA	461b3ff4-8e35-466f-888d-83757423c9cc	https://app.midtrans.com/snap/v4/redirection/461b3ff4-8e35-466f-888d-83757423c9cc	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 10:01:15.471	2025-08-27 10:01:15.471
384	RYLS412ZKFZ	71f83954-fa5a-43af-b498-220006db3564	https://app.midtrans.com/snap/v4/redirection/71f83954-fa5a-43af-b498-220006db3564	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 10:01:31.116	2025-08-27 10:01:31.116
385	RYLS413QONNLT	00facb6b-0b37-44cd-9c14-ff0bea383cbe	https://app.midtrans.com/snap/v4/redirection/00facb6b-0b37-44cd-9c14-ff0bea383cbe	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 10:06:22.324	2025-08-27 10:06:22.324
386	RYLS414PORPCSC	c028977e-3105-4073-8e21-45eb301c6ae7	https://app.midtrans.com/snap/v4/redirection/c028977e-3105-4073-8e21-45eb301c6ae7	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 10:30:15.7	2025-08-27 10:30:15.7
387	RYLS415PRAGNNZ	2fb54122-db24-49f2-894b-c7886b904ebd	https://app.midtrans.com/snap/v4/redirection/2fb54122-db24-49f2-894b-c7886b904ebd	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 10:41:12.394	2025-08-27 10:41:12.394
388	RYLS416JKKIH	7aa0a7b5-d648-42f3-b415-ccda2c4ac695	https://app.midtrans.com/snap/v4/redirection/7aa0a7b5-d648-42f3-b415-ccda2c4ac695	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 10:48:56.069	2025-08-27 10:48:56.069
389	RYLS417WNVRJYB	5a624e6e-27a5-492a-bbe2-91a26589d7e1	https://app.midtrans.com/snap/v4/redirection/5a624e6e-27a5-492a-bbe2-91a26589d7e1	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 10:49:21.352	2025-08-27 10:49:21.352
390	RYLS418APDYIMT	df06f091-c4f7-4bd6-af12-a7f683e22382	https://app.midtrans.com/snap/v4/redirection/df06f091-c4f7-4bd6-af12-a7f683e22382	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 11:18:22.912	2025-08-27 11:18:22.912
391	RYLS419YKDAGD	f355150b-1ada-4ec3-92ed-b2e0ba887d6f	https://app.midtrans.com/snap/v4/redirection/f355150b-1ada-4ec3-92ed-b2e0ba887d6f	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 11:28:16.149	2025-08-27 11:28:16.149
392	RYLS420IPMAEW	6538c9bd-f08b-4f70-8e3c-c9d5b27bb882	https://app.midtrans.com/snap/v4/redirection/6538c9bd-f08b-4f70-8e3c-c9d5b27bb882	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 12:45:47.356	2025-08-27 12:45:47.356
393	RYLS421LFWQ	148af1cf-d234-439e-a578-30badf661084	https://app.midtrans.com/snap/v4/redirection/148af1cf-d234-439e-a578-30badf661084	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 12:48:12.722	2025-08-27 12:48:12.722
394	RYLS422XSYOO	d75f746d-4ee4-4685-990d-c1c9b0952d05	https://app.midtrans.com/snap/v4/redirection/d75f746d-4ee4-4685-990d-c1c9b0952d05	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 13:25:21.692	2025-08-27 13:25:21.692
395	RYLS423UAZYHTGO	1d93e650-8941-4307-9bad-8bae57fa2977	https://app.midtrans.com/snap/v4/redirection/1d93e650-8941-4307-9bad-8bae57fa2977	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 13:30:00.752	2025-08-27 13:30:00.752
396	RYLS424AVEBFP	82be2f26-fb6b-45ba-b01b-5715fbec516f	https://app.midtrans.com/snap/v4/redirection/82be2f26-fb6b-45ba-b01b-5715fbec516f	\N	\N	12193602	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 13:48:42.486	2025-08-27 13:48:42.486
397	RYLS425GPYFMG	93a5b88c-96ef-4978-970a-8ea682c3f2c6	https://app.midtrans.com/snap/v4/redirection/93a5b88c-96ef-4978-970a-8ea682c3f2c6	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 13:49:19.246	2025-08-27 13:49:19.246
398	RYLS426BDQSF	4c92659d-bdc2-405d-b7c0-ca7a2db4759b	https://app.midtrans.com/snap/v4/redirection/4c92659d-bdc2-405d-b7c0-ca7a2db4759b	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 13:50:42.132	2025-08-27 13:50:42.132
399	RYLS428HXAJGF	698d1a9b-6d7f-40dd-9d1f-16adcb2d4daa	https://app.midtrans.com/snap/v4/redirection/698d1a9b-6d7f-40dd-9d1f-16adcb2d4daa	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 14:19:34.753	2025-08-27 14:19:34.753
400	RYLS429SRDALQ	dfac3427-3da5-4234-a15e-fefe2ba6dac5	https://app.midtrans.com/snap/v4/redirection/dfac3427-3da5-4234-a15e-fefe2ba6dac5	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 14:30:13.056	2025-08-27 14:30:13.056
401	RYLS430VQGLAVK	d939ac78-a012-427d-92b1-f840021bc3aa	https://app.midtrans.com/snap/v4/redirection/d939ac78-a012-427d-92b1-f840021bc3aa	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 15:17:19.62	2025-08-27 15:17:19.62
402	RYLS431SNMAD	353a8f95-1a2c-464f-bc4a-cb06bec3c4fe	https://app.midtrans.com/snap/v4/redirection/353a8f95-1a2c-464f-bc4a-cb06bec3c4fe	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 16:11:46.939	2025-08-27 16:11:46.939
403	RYLS432HCFETFG	d3a7e987-06c6-4476-b5ff-934f437ac96d	https://app.midtrans.com/snap/v4/redirection/d3a7e987-06c6-4476-b5ff-934f437ac96d	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 16:27:03.05	2025-08-27 16:27:03.05
404	RYLS433RHZ	b9558129-cc25-4d9c-8884-78490bea5505	https://app.midtrans.com/snap/v4/redirection/b9558129-cc25-4d9c-8884-78490bea5505	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 16:38:56.698	2025-08-27 16:38:56.698
405	RYLS435SGEG	5a49c875-8d36-4a4f-9331-f4174ddf42b2	https://app.midtrans.com/snap/v4/redirection/5a49c875-8d36-4a4f-9331-f4174ddf42b2	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 18:32:32.98	2025-08-27 18:32:32.98
406	RYLS436QNGBYK	4215c844-3054-4bb4-8881-632520487002	https://app.midtrans.com/snap/v4/redirection/4215c844-3054-4bb4-8881-632520487002	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 19:06:00.486	2025-08-27 19:06:00.486
407	RYLS437LELZPG	596babbb-179c-4c4d-a7d3-973617a6b910	https://app.midtrans.com/snap/v4/redirection/596babbb-179c-4c4d-a7d3-973617a6b910	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 20:38:35.369	2025-08-27 20:38:35.369
408	RYLS438MIAXYQW	dd71db7b-2089-4ec4-b10e-32f2dd625b29	https://app.midtrans.com/snap/v4/redirection/dd71db7b-2089-4ec4-b10e-32f2dd625b29	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 21:34:14.324	2025-08-27 21:34:14.324
409	RYLS439DLAMYS	602cc8a3-3fd4-424d-9ca6-2539d32a1545	https://app.midtrans.com/snap/v4/redirection/602cc8a3-3fd4-424d-9ca6-2539d32a1545	\N	\N	243872	IDR	pending	\N	{}	{}	\N	\N	2025-08-27 23:30:29.928	2025-08-27 23:30:29.928
410	RYLS440OOCI	143865e1-e300-40a6-a391-c9f787ee763a	https://app.midtrans.com/snap/v4/redirection/143865e1-e300-40a6-a391-c9f787ee763a	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 00:01:11.507	2025-08-28 00:01:11.507
411	RYLS441VOFQ	b5617aa2-2c21-4dcf-ae2c-38ef5bf731c8	https://app.midtrans.com/snap/v4/redirection/b5617aa2-2c21-4dcf-ae2c-38ef5bf731c8	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 00:30:42.912	2025-08-28 00:30:42.912
412	RYLS442TAV	acec64ce-c4fe-4c7a-b5d4-c680a8083c2b	https://app.midtrans.com/snap/v4/redirection/acec64ce-c4fe-4c7a-b5d4-c680a8083c2b	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 00:41:30.259	2025-08-28 00:41:30.259
413	RYLS443BZBLPB	0b5c9365-7e46-4885-8232-01742a021763	https://app.midtrans.com/snap/v4/redirection/0b5c9365-7e46-4885-8232-01742a021763	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 00:49:00.103	2025-08-28 00:49:00.103
414	RYLS444MHE	1cb1f0e4-58fb-43a0-8d24-1da90819a97d	https://app.midtrans.com/snap/v4/redirection/1cb1f0e4-58fb-43a0-8d24-1da90819a97d	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 01:27:29.682	2025-08-28 01:27:29.682
415	RYLS445YINMPD	6fc2b550-cbc9-46a5-8e44-f361eb9ba0a4	https://app.midtrans.com/snap/v4/redirection/6fc2b550-cbc9-46a5-8e44-f361eb9ba0a4	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 01:32:51.827	2025-08-28 01:32:51.827
416	RYLS446YKZMPT	bcb89fbd-ebaf-469e-9927-55b01b470f39	https://app.midtrans.com/snap/v4/redirection/bcb89fbd-ebaf-469e-9927-55b01b470f39	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 02:13:01.16	2025-08-28 02:13:01.16
417	RYLS447PVLU	044ec44c-ab6b-4b4a-998a-498b2f697121	https://app.midtrans.com/snap/v4/redirection/044ec44c-ab6b-4b4a-998a-498b2f697121	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 02:44:39.389	2025-08-28 02:44:39.389
418	RYLS448XROAS	007a9c4c-15e2-4875-9110-69fa30dae346	https://app.midtrans.com/snap/v4/redirection/007a9c4c-15e2-4875-9110-69fa30dae346	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 02:45:23.86	2025-08-28 02:45:23.86
419	RYLS449HYJZHN	302758cb-0afc-439d-ae73-76793fe56fce	https://app.midtrans.com/snap/v4/redirection/302758cb-0afc-439d-ae73-76793fe56fce	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 02:49:02.133	2025-08-28 02:49:02.133
420	RYLS450DAGZFSS	072feca7-b90f-46aa-82b7-1c1f406cd591	https://app.midtrans.com/snap/v4/redirection/072feca7-b90f-46aa-82b7-1c1f406cd591	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 02:52:03.888	2025-08-28 02:52:03.888
421	RYLS451BMZWNQY	cfc7bf4d-dbd9-4b0e-90cb-20421c067fe3	https://app.midtrans.com/snap/v4/redirection/cfc7bf4d-dbd9-4b0e-90cb-20421c067fe3	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 07:02:56.766	2025-08-28 07:02:56.766
422	RYLS452RXSDLG	b8bfac54-1cf4-4526-96fd-a9baab404bdb	https://app.midtrans.com/snap/v4/redirection/b8bfac54-1cf4-4526-96fd-a9baab404bdb	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 07:55:47.553	2025-08-28 07:55:47.553
423	RYLS453LOOWSN	73db7648-09d6-4a28-ab80-ffcd859f666c	https://app.midtrans.com/snap/v4/redirection/73db7648-09d6-4a28-ab80-ffcd859f666c	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 08:29:51.887	2025-08-28 08:29:51.887
424	RYLS454DHSZ	0730ac5f-4707-4919-9f75-d0f8eb15f377	https://app.midtrans.com/snap/v4/redirection/0730ac5f-4707-4919-9f75-d0f8eb15f377	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 08:51:39.311	2025-08-28 08:51:39.311
425	RYLS455YYWVIOZ	3a07c650-249f-4a2a-b44c-6f7e8bb5536d	https://app.midtrans.com/snap/v4/redirection/3a07c650-249f-4a2a-b44c-6f7e8bb5536d	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 09:19:08.597	2025-08-28 09:19:08.597
426	RYLS456MIMHJ	c4100b88-a652-43ea-a62c-c590cd36d83f	https://app.midtrans.com/snap/v4/redirection/c4100b88-a652-43ea-a62c-c590cd36d83f	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 09:20:24.657	2025-08-28 09:20:24.657
427	RYLS457QEVDSZ	4cb70668-4cce-4678-83b8-41f76d2dad12	https://app.midtrans.com/snap/v4/redirection/4cb70668-4cce-4678-83b8-41f76d2dad12	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 10:50:29.674	2025-08-28 10:50:29.674
428	RYLS458LTWADWY	ed67219e-f181-45e9-af8f-ce6b462c5178	https://app.midtrans.com/snap/v4/redirection/ed67219e-f181-45e9-af8f-ce6b462c5178	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 10:54:23.94	2025-08-28 10:54:23.94
429	RYLS459OWUCKAY	6fa7ca3f-84e2-4615-9d26-87357c577f3a	https://app.midtrans.com/snap/v4/redirection/6fa7ca3f-84e2-4615-9d26-87357c577f3a	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 11:31:49.966	2025-08-28 11:31:49.966
430	RYLS460CYOZ	580bdd37-d0e8-42d0-858a-8e56a668ee96	https://app.midtrans.com/snap/v4/redirection/580bdd37-d0e8-42d0-858a-8e56a668ee96	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 11:44:06.199	2025-08-28 11:44:06.199
431	RYLS461GCZY	19b2e4fa-e1e5-4874-8f51-b3aa83c710e4	https://app.midtrans.com/snap/v4/redirection/19b2e4fa-e1e5-4874-8f51-b3aa83c710e4	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 11:52:15.109	2025-08-28 11:52:15.109
432	RYLS462HUNJL	f9075a6f-b502-423c-bc2f-efee0e851b8f	https://app.midtrans.com/snap/v4/redirection/f9075a6f-b502-423c-bc2f-efee0e851b8f	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 12:10:40.425	2025-08-28 12:10:40.425
433	RYLS463DEEWPVRP	e63d5a52-8f44-4ddd-8f73-35fd0308f907	https://app.midtrans.com/snap/v4/redirection/e63d5a52-8f44-4ddd-8f73-35fd0308f907	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 12:26:01.418	2025-08-28 12:26:01.418
434	RYLS464PS	498a4ede-58c0-4786-b2c1-1dc6b794e88c	https://app.midtrans.com/snap/v4/redirection/498a4ede-58c0-4786-b2c1-1dc6b794e88c	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 12:38:01.855	2025-08-28 12:38:01.855
435	RYLS465WPFWY	a09d7c27-b710-4edf-9fd6-2e72a0b97da6	https://app.midtrans.com/snap/v4/redirection/a09d7c27-b710-4edf-9fd6-2e72a0b97da6	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 12:46:06.456	2025-08-28 12:46:06.456
436	RYLS466WOCEYF	8766def1-7f3b-4088-b98c-7ef1afc9ecd8	https://app.midtrans.com/snap/v4/redirection/8766def1-7f3b-4088-b98c-7ef1afc9ecd8	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 12:52:05.895	2025-08-28 12:52:05.895
437	RYLS467NTOLSHFN	b32403f4-dd7f-433e-a1e0-ca1bb6986329	https://app.midtrans.com/snap/v4/redirection/b32403f4-dd7f-433e-a1e0-ca1bb6986329	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 12:52:16.294	2025-08-28 12:52:16.294
438	RYLS468FIKCY	f81ed3d7-08ee-45c0-8bd9-c83e139721b0	https://app.midtrans.com/snap/v4/redirection/f81ed3d7-08ee-45c0-8bd9-c83e139721b0	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 12:54:50.833	2025-08-28 12:54:50.833
439	RYLS469MAUOXFI	084d1969-6391-495c-a3f4-dff135af8d0f	https://app.midtrans.com/snap/v4/redirection/084d1969-6391-495c-a3f4-dff135af8d0f	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 13:09:12.173	2025-08-28 13:09:12.173
440	RYLS470TNLSNM	657f17ee-ba31-4af7-9227-e4fdbfa2946d	https://app.midtrans.com/snap/v4/redirection/657f17ee-ba31-4af7-9227-e4fdbfa2946d	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 13:15:32.318	2025-08-28 13:15:32.318
441	RYLS471PZGRW	b0d482f4-9ad7-4db0-a249-82be8f2997e3	https://app.midtrans.com/snap/v4/redirection/b0d482f4-9ad7-4db0-a249-82be8f2997e3	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 13:37:09.665	2025-08-28 13:37:09.665
442	RYLS472QHWWRTE	98516d4f-8d8a-4708-a327-7db1a003cbd0	https://app.midtrans.com/snap/v4/redirection/98516d4f-8d8a-4708-a327-7db1a003cbd0	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 13:55:41.972	2025-08-28 13:55:41.972
443	RYLS473SCQXT	a9d3c368-e899-45f4-abbd-0f6f052e3a20	https://app.midtrans.com/snap/v4/redirection/a9d3c368-e899-45f4-abbd-0f6f052e3a20	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 15:08:58.498	2025-08-28 15:08:58.498
444	RYLS474TKDIB	08ad0217-9526-4d49-8328-fc5f5ee60780	https://app.midtrans.com/snap/v4/redirection/08ad0217-9526-4d49-8328-fc5f5ee60780	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 15:12:57.257	2025-08-28 15:12:57.257
445	RYLS475GLXSU	69200a9e-939d-4c26-b662-de43b2f4b4d0	https://app.midtrans.com/snap/v4/redirection/69200a9e-939d-4c26-b662-de43b2f4b4d0	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 15:28:31.654	2025-08-28 15:28:31.654
446	RYLS476BHTBJZON	f0bfb2c8-55de-400c-9691-8941bc6b16c1	https://app.midtrans.com/snap/v4/redirection/f0bfb2c8-55de-400c-9691-8941bc6b16c1	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 16:02:01.4	2025-08-28 16:02:01.4
447	RYLS477XSOOTT	81bd24bd-b616-4392-b43a-77cd1a9057b7	https://app.midtrans.com/snap/v4/redirection/81bd24bd-b616-4392-b43a-77cd1a9057b7	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 16:03:59.655	2025-08-28 16:03:59.655
448	RYLS478RMBNE	3cb3502a-71a5-49c6-bb2f-64bd8b8f03a8	https://app.midtrans.com/snap/v4/redirection/3cb3502a-71a5-49c6-bb2f-64bd8b8f03a8	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 18:04:21.186	2025-08-28 18:04:21.186
449	RYLS479HGLUCLXW	e4faa665-1b6e-4d28-a1ce-22e1d9a6846a	https://app.midtrans.com/snap/v4/redirection/e4faa665-1b6e-4d28-a1ce-22e1d9a6846a	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 19:29:31.122	2025-08-28 19:29:31.122
450	RYLS480CDWSMW	ea82b2e8-f982-4d98-b029-fb6bcd4a40c5	https://app.midtrans.com/snap/v4/redirection/ea82b2e8-f982-4d98-b029-fb6bcd4a40c5	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 19:41:04.289	2025-08-28 19:41:04.289
451	RYLS481TY	f0ba2e74-18f0-4638-af1d-a184610765ac	https://app.midtrans.com/snap/v4/redirection/f0ba2e74-18f0-4638-af1d-a184610765ac	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 20:49:15.545	2025-08-28 20:49:15.545
452	RYLS482ELSJKC	a0f17785-c445-48e7-b9c9-18b6876a2c11	https://app.midtrans.com/snap/v4/redirection/a0f17785-c445-48e7-b9c9-18b6876a2c11	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 21:35:56.549	2025-08-28 21:35:56.549
453	RYLS483LLYAX	0d3c35d6-ca80-483a-8466-db34203b488b	https://app.midtrans.com/snap/v4/redirection/0d3c35d6-ca80-483a-8466-db34203b488b	\N	\N	245081	IDR	pending	\N	{}	{}	\N	\N	2025-08-28 21:41:42.175	2025-08-28 21:41:42.175
454	RYLS484GBCBND	42644d55-5006-4140-a3dc-fad1fa32b83f	https://app.midtrans.com/snap/v4/redirection/42644d55-5006-4140-a3dc-fad1fa32b83f	\N	\N	245059	IDR	pending	\N	{}	{}	\N	\N	2025-08-29 00:55:24.384	2025-08-29 00:55:24.384
455	RYLS485PDNJVQY	e3608628-9816-40e4-8ad2-ff4ad58b0ba0	https://app.midtrans.com/snap/v4/redirection/e3608628-9816-40e4-8ad2-ff4ad58b0ba0	\N	\N	245059	IDR	pending	\N	{}	{}	\N	\N	2025-08-29 03:43:07.297	2025-08-29 03:43:07.297
456	RYLS486UEYZP	df8c6129-7db9-4a44-901d-713f2070acd0	https://app.midtrans.com/snap/v4/redirection/df8c6129-7db9-4a44-901d-713f2070acd0	\N	\N	245059	IDR	pending	\N	{}	{}	\N	\N	2025-08-29 03:51:55.836	2025-08-29 03:51:55.836
457	RYLS487VLPD	b66a4cfb-0d93-4e21-b563-da504ce2fb2f	https://app.midtrans.com/snap/v4/redirection/b66a4cfb-0d93-4e21-b563-da504ce2fb2f	\N	\N	245059	IDR	pending	\N	{}	{}	\N	\N	2025-08-29 04:42:09.922	2025-08-29 04:42:09.922
458	RYLS489IDNYHFN	b3a8de98-ea99-4f24-90dc-4a7efadd112f	https://app.midtrans.com/snap/v4/redirection/b3a8de98-ea99-4f24-90dc-4a7efadd112f	\N	\N	245059	IDR	pending	\N	{}	{}	\N	\N	2025-08-29 06:28:15.352	2025-08-29 06:28:15.352
459	RYLS490CUAHP	e20aac62-3b04-420f-902b-4c77977ae98b	https://app.midtrans.com/snap/v4/redirection/e20aac62-3b04-420f-902b-4c77977ae98b	\N	\N	245059	IDR	pending	\N	{}	{}	\N	\N	2025-08-29 06:41:33.299	2025-08-29 06:41:33.299
460	RYLS491ORN	1f63bfeb-90d0-44c8-8955-5262fd401943	https://app.midtrans.com/snap/v4/redirection/1f63bfeb-90d0-44c8-8955-5262fd401943	\N	\N	245059	IDR	pending	\N	{}	{}	\N	\N	2025-08-29 07:42:08.085	2025-08-29 07:42:08.085
461	RYLS492JDKYGU	5cf4b615-cda4-4876-a4ec-50cf8930b71b	https://app.midtrans.com/snap/v4/redirection/5cf4b615-cda4-4876-a4ec-50cf8930b71b	\N	\N	245059	IDR	pending	\N	{}	{}	\N	\N	2025-08-29 07:45:43.073	2025-08-29 07:45:43.073
462	RYLS493ATQFBLG	4b6385d7-9a10-4f48-ad47-79a00f62b3cb	https://app.midtrans.com/snap/v4/redirection/4b6385d7-9a10-4f48-ad47-79a00f62b3cb	\N	\N	245059	IDR	pending	\N	{}	{}	\N	\N	2025-08-29 08:35:56.295	2025-08-29 08:35:56.295
463	RYLS494HYXH	21f89d84-1a8e-40a8-b1c6-bdc919d1d4e4	https://app.midtrans.com/snap/v4/redirection/21f89d84-1a8e-40a8-b1c6-bdc919d1d4e4	\N	\N	245059	IDR	pending	\N	{}	{}	\N	\N	2025-08-29 08:36:26.163	2025-08-29 08:36:26.163
464	RYLS495KBAWOGPJ	daae0456-e7bd-42c3-8cc7-9260fa6353f9	https://app.midtrans.com/snap/v4/redirection/daae0456-e7bd-42c3-8cc7-9260fa6353f9	\N	\N	245059	IDR	pending	\N	{}	{}	\N	\N	2025-08-29 08:58:00.2	2025-08-29 08:58:00.2
465	RYLS496XGHAU	93b28229-e5d2-4c09-8469-f9206eccead3	https://app.midtrans.com/snap/v4/redirection/93b28229-e5d2-4c09-8469-f9206eccead3	\N	\N	245059	IDR	pending	\N	{}	{}	\N	\N	2025-08-29 10:21:20.944	2025-08-29 10:21:20.944
466	RYLS497LSZL	f0ba4d31-2e41-4cb5-bdf7-9073006f0eb2	https://app.midtrans.com/snap/v4/redirection/f0ba4d31-2e41-4cb5-bdf7-9073006f0eb2	\N	\N	245059	IDR	pending	\N	{}	{}	\N	\N	2025-08-29 11:42:59.127	2025-08-29 11:42:59.127
467	RYLS498BCTHHZVO	2dc5eea1-55d9-4691-b6ef-6fd00218fd70	https://app.midtrans.com/snap/v4/redirection/2dc5eea1-55d9-4691-b6ef-6fd00218fd70	\N	\N	245059	IDR	pending	\N	{}	{}	\N	\N	2025-08-29 12:50:45.657	2025-08-29 12:50:45.657
468	RYLS499LSLFVC	05f17811-a1eb-4249-9b02-cc62a39e0e33	https://app.midtrans.com/snap/v4/redirection/05f17811-a1eb-4249-9b02-cc62a39e0e33	\N	\N	245059	IDR	pending	\N	{}	{}	\N	\N	2025-08-29 13:06:40.095	2025-08-29 13:06:40.095
469	RYLS500XMPQWUOF	b454178d-dc8c-4b0f-b19e-df9f9e5ffc5d	https://app.midtrans.com/snap/v4/redirection/b454178d-dc8c-4b0f-b19e-df9f9e5ffc5d	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 02:23:14.499	2025-08-30 02:23:14.499
470	RYLS501OPJDRCX	919d64a4-2b89-44d4-a865-77dcba15fbe7	https://app.midtrans.com/snap/v4/redirection/919d64a4-2b89-44d4-a865-77dcba15fbe7	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 05:59:20.694	2025-08-30 05:59:20.694
471	RYLS502CEXOQYM	485cc9da-2b40-4db1-af2f-5c404166eb19	https://app.midtrans.com/snap/v4/redirection/485cc9da-2b40-4db1-af2f-5c404166eb19	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 06:08:08.116	2025-08-30 06:08:08.116
472	RYLS503VKWD	accbcfc3-5500-4d5e-9874-d48ff0c84982	https://app.midtrans.com/snap/v4/redirection/accbcfc3-5500-4d5e-9874-d48ff0c84982	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 07:11:14.48	2025-08-30 07:11:14.48
473	RYLS504XCPUVIS	3477bf8d-2fd1-48ef-b2b0-88cdabcc6971	https://app.midtrans.com/snap/v4/redirection/3477bf8d-2fd1-48ef-b2b0-88cdabcc6971	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 07:20:28.667	2025-08-30 07:20:28.667
474	RYLS505J	bb06655b-b7ba-4030-8659-aa3c58020158	https://app.midtrans.com/snap/v4/redirection/bb06655b-b7ba-4030-8659-aa3c58020158	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 07:49:10.342	2025-08-30 07:49:10.342
475	RYLS506NNFQSXEZ	0cedf365-18b3-4a79-b2f2-da0e54772e11	https://app.midtrans.com/snap/v4/redirection/0cedf365-18b3-4a79-b2f2-da0e54772e11	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 08:10:40.95	2025-08-30 08:10:40.95
476	RYLS507AUBEAM	803a52fb-b823-4f02-813f-9094a6798826	https://app.midtrans.com/snap/v4/redirection/803a52fb-b823-4f02-813f-9094a6798826	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 09:43:15.553	2025-08-30 09:43:15.553
477	RYLS508FNXMLV	b777f87f-2865-446f-bf7a-7f5a9508801b	https://app.midtrans.com/snap/v4/redirection/b777f87f-2865-446f-bf7a-7f5a9508801b	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 12:10:08.112	2025-08-30 12:10:08.112
478	RYLS509GZDBYQX	060d5ee2-496a-400e-9061-bbd3da2a2863	https://app.midtrans.com/snap/v4/redirection/060d5ee2-496a-400e-9061-bbd3da2a2863	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 13:34:31.289	2025-08-30 13:34:31.289
479	RYLS510IHZG	3691ef3c-180a-45b9-ad95-2d3f9d1a3447	https://app.midtrans.com/snap/v4/redirection/3691ef3c-180a-45b9-ad95-2d3f9d1a3447	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 13:39:46.554	2025-08-30 13:39:46.554
480	RYLS512RAIXE	f7cb9795-c309-444b-812a-d1f80dda06fc	https://app.midtrans.com/snap/v4/redirection/f7cb9795-c309-444b-812a-d1f80dda06fc	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 14:52:04.369	2025-08-30 14:52:04.369
481	RYLS513WZLXG	deab67b0-d96f-492f-8e0e-c9f67d693f05	https://app.midtrans.com/snap/v4/redirection/deab67b0-d96f-492f-8e0e-c9f67d693f05	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 15:23:35.644	2025-08-30 15:23:35.644
482	RYLS514ZMZBBKHA	8eb9c477-2633-4da7-848b-54a214495140	https://app.midtrans.com/snap/v4/redirection/8eb9c477-2633-4da7-848b-54a214495140	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 15:27:27.281	2025-08-30 15:27:27.281
483	RYLS515RQTPZ	4e33b14f-ce1e-43fb-81b0-251e81c820d7	https://app.midtrans.com/snap/v4/redirection/4e33b14f-ce1e-43fb-81b0-251e81c820d7	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 15:31:55.57	2025-08-30 15:31:55.57
484	RYLS516OMDLLS	7f4d9ca2-f39f-45d7-8526-c93ee047df02	https://app.midtrans.com/snap/v4/redirection/7f4d9ca2-f39f-45d7-8526-c93ee047df02	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 15:44:43.437	2025-08-30 15:44:43.437
485	RYLS517ALLN	d01824fd-3e99-4a4c-8e9b-1befedfff6d2	https://app.midtrans.com/snap/v4/redirection/d01824fd-3e99-4a4c-8e9b-1befedfff6d2	\N	\N	246910	IDR	pending	\N	{}	{}	\N	\N	2025-08-30 16:08:21.644	2025-08-30 16:08:21.644
486	RYLS521WDIGNP	063f0745-b408-46f9-a146-e0d592bd681e	https://app.midtrans.com/snap/v4/redirection/063f0745-b408-46f9-a146-e0d592bd681e	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 03:42:45.442	2025-08-31 03:42:45.442
487	RYLS522CDYGRT	feca754d-03f5-493a-9e69-ad224994eff7	https://app.midtrans.com/snap/v4/redirection/feca754d-03f5-493a-9e69-ad224994eff7	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 08:45:12.777	2025-08-31 08:45:12.777
488	RYLS523FY	2beb0fef-ce94-4392-b921-aa2e5e5bf9bf	https://app.midtrans.com/snap/v4/redirection/2beb0fef-ce94-4392-b921-aa2e5e5bf9bf	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 11:43:40.647	2025-08-31 11:43:40.647
489	RYLS524AWYQJTH	c5e53027-647b-48bc-b0af-15c5736a3996	https://app.midtrans.com/snap/v4/redirection/c5e53027-647b-48bc-b0af-15c5736a3996	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 12:06:30.767	2025-08-31 12:06:30.767
490	RYLS525IRKSGGM	7dbf69ac-2909-4f54-9cd3-e090f5345e60	https://app.midtrans.com/snap/v4/redirection/7dbf69ac-2909-4f54-9cd3-e090f5345e60	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 12:09:18.479	2025-08-31 12:09:18.479
491	RYLS526BFF	f6a5d7ac-47d5-4e35-b57a-e2f0f482d26a	https://app.midtrans.com/snap/v4/redirection/f6a5d7ac-47d5-4e35-b57a-e2f0f482d26a	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 13:03:13.712	2025-08-31 13:03:13.712
492	RYLS527NYQFVX	c3213d72-5425-4a95-9628-39b2f0ab6767	https://app.midtrans.com/snap/v4/redirection/c3213d72-5425-4a95-9628-39b2f0ab6767	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 13:35:44.398	2025-08-31 13:35:44.398
493	RYLS528LYPFSR	d46f2f1d-d5b0-44bd-b21a-384861f28f2f	https://app.midtrans.com/snap/v4/redirection/d46f2f1d-d5b0-44bd-b21a-384861f28f2f	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 14:17:28.467	2025-08-31 14:17:28.467
494	RYLS529DVZNWK	1d363380-bf74-4a9b-ad71-2313418b5134	https://app.midtrans.com/snap/v4/redirection/1d363380-bf74-4a9b-ad71-2313418b5134	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 14:41:48.054	2025-08-31 14:41:48.054
495	RYLS530QPJXWN	21aece9c-e42b-4953-b089-2136f14eaeaa	https://app.midtrans.com/snap/v4/redirection/21aece9c-e42b-4953-b089-2136f14eaeaa	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 14:55:51.175	2025-08-31 14:55:51.175
496	RYLS531ILKOKZJ	7b7630e6-6e05-46c2-b0ef-53eff06d26a1	https://app.midtrans.com/snap/v4/redirection/7b7630e6-6e05-46c2-b0ef-53eff06d26a1	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 14:57:33.4	2025-08-31 14:57:33.4
497	RYLS532DDRQ	c5c650ea-9763-48a8-ab6b-92d154ab006c	https://app.midtrans.com/snap/v4/redirection/c5c650ea-9763-48a8-ab6b-92d154ab006c	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 16:04:42.363	2025-08-31 16:04:42.363
498	RYLS533UGOWU	b85a9861-e6f8-45ef-8a6d-63ac476b62ae	https://app.midtrans.com/snap/v4/redirection/b85a9861-e6f8-45ef-8a6d-63ac476b62ae	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 17:24:35.456	2025-08-31 17:24:35.456
499	RYLS534TDHCNFRW	05e3c357-7082-43cf-be70-16ed4b4ce95c	https://app.midtrans.com/snap/v4/redirection/05e3c357-7082-43cf-be70-16ed4b4ce95c	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 18:00:30.993	2025-08-31 18:00:30.993
500	RYLS535VTDL	2321cae2-3a74-4e1d-b478-0d07ecc0052b	https://app.midtrans.com/snap/v4/redirection/2321cae2-3a74-4e1d-b478-0d07ecc0052b	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 18:15:33.951	2025-08-31 18:15:33.951
501	RYLS536WXJFA	1e86dfa3-ccb5-4120-b42d-e7b771f55777	https://app.midtrans.com/snap/v4/redirection/1e86dfa3-ccb5-4120-b42d-e7b771f55777	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 18:49:33.141	2025-08-31 18:49:33.141
502	RYLS537TUFIESJ	bbef1857-d3b1-4ddb-b8e2-44da522f9381	https://app.midtrans.com/snap/v4/redirection/bbef1857-d3b1-4ddb-b8e2-44da522f9381	\N	\N	246725	IDR	pending	\N	{}	{}	\N	\N	2025-08-31 19:02:32.256	2025-08-31 19:02:32.256
503	RYLS538KZHSUYCC	3aa10b30-187d-4815-890a-9a3621a2fa6a	https://app.midtrans.com/snap/v4/redirection/3aa10b30-187d-4815-890a-9a3621a2fa6a	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 02:55:16.148	2025-09-01 02:55:16.148
504	RYLS539NAQOC	d3727deb-3e6c-40ed-8ac1-b3221854c122	https://app.midtrans.com/snap/v4/redirection/d3727deb-3e6c-40ed-8ac1-b3221854c122	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 03:18:23.171	2025-09-01 03:18:23.171
505	RYLS540IGBYHSN	5c9abb55-7009-43f1-8dfa-21fb7952613a	https://app.midtrans.com/snap/v4/redirection/5c9abb55-7009-43f1-8dfa-21fb7952613a	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 03:21:19.61	2025-09-01 03:21:19.61
506	RYLS541PPMFTB	61b27134-a003-4f9a-8b74-61a03769ccae	https://app.midtrans.com/snap/v4/redirection/61b27134-a003-4f9a-8b74-61a03769ccae	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 06:31:32.244	2025-09-01 06:31:32.244
507	RYLS542OYEGJF	59ca33b2-a735-47a1-94c7-6cb89647a68f	https://app.midtrans.com/snap/v4/redirection/59ca33b2-a735-47a1-94c7-6cb89647a68f	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 07:34:23.922	2025-09-01 07:34:23.922
508	RYLS543IIK	9c047a1e-0acd-40b6-9a52-1d089f84b9ad	https://app.midtrans.com/snap/v4/redirection/9c047a1e-0acd-40b6-9a52-1d089f84b9ad	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 07:36:16.562	2025-09-01 07:36:16.562
509	RYLS544XWWNX	9b1321d6-711d-423a-ba2a-df7ce333d09c	https://app.midtrans.com/snap/v4/redirection/9b1321d6-711d-423a-ba2a-df7ce333d09c	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 07:36:56.935	2025-09-01 07:36:56.935
510	RYLS545FWZJN	f1d9f9c3-13eb-41e3-883c-2089b825cade	https://app.midtrans.com/snap/v4/redirection/f1d9f9c3-13eb-41e3-883c-2089b825cade	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 08:38:37.499	2025-09-01 08:38:37.499
511	RYLS546GHWVO	0bd39b4b-3ac6-491e-980b-b3f690e28b52	https://app.midtrans.com/snap/v4/redirection/0bd39b4b-3ac6-491e-980b-b3f690e28b52	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 09:02:47.765	2025-09-01 09:02:47.765
512	RYLS547RPS	fd9490ea-8fec-4677-9266-0061be57c56c	https://app.midtrans.com/snap/v4/redirection/fd9490ea-8fec-4677-9266-0061be57c56c	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 09:05:46.015	2025-09-01 09:05:46.015
513	RYLS548IQHWKFO	33860d5c-7e38-49fd-842d-30d7df7d3b28	https://app.midtrans.com/snap/v4/redirection/33860d5c-7e38-49fd-842d-30d7df7d3b28	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 09:09:08.883	2025-09-01 09:09:08.883
514	RYLS549KEYUWOGJ	cf202806-d2ae-4a65-ba73-3d7035fde8a8	https://app.midtrans.com/snap/v4/redirection/cf202806-d2ae-4a65-ba73-3d7035fde8a8	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 09:11:51.826	2025-09-01 09:11:51.826
515	RYLS550CQGIL	42d592b3-4131-45d4-9867-21edf60ebe82	https://app.midtrans.com/snap/v4/redirection/42d592b3-4131-45d4-9867-21edf60ebe82	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 09:12:30.482	2025-09-01 09:12:30.482
516	RYLS551ZXHJ	26298191-b779-40b6-bded-0aa66350302d	https://app.midtrans.com/snap/v4/redirection/26298191-b779-40b6-bded-0aa66350302d	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 09:20:17.042	2025-09-01 09:20:17.042
517	RYLS552IDJXSHZ	95241632-2302-44a2-9273-8be7c0ea9ae9	https://app.midtrans.com/snap/v4/redirection/95241632-2302-44a2-9273-8be7c0ea9ae9	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 11:17:55.861	2025-09-01 11:17:55.861
518	RYLS553DNZGKK	ed6acede-dda9-42e1-860c-8e3c143b030f	https://app.midtrans.com/snap/v4/redirection/ed6acede-dda9-42e1-860c-8e3c143b030f	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 11:42:39.439	2025-09-01 11:42:39.439
519	RYLS554IOM	3ec69a81-9a27-410d-b3f1-37a4bc180a43	https://app.midtrans.com/snap/v4/redirection/3ec69a81-9a27-410d-b3f1-37a4bc180a43	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 11:45:07.293	2025-09-01 11:45:07.293
520	RYLS555IVTNXLS	0466a319-5ee9-4c2a-9219-fdc2f894b3bc	https://app.midtrans.com/snap/v4/redirection/0466a319-5ee9-4c2a-9219-fdc2f894b3bc	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 14:14:17.868	2025-09-01 14:14:17.868
521	RYLS556ZNM	6d7eb85e-737f-48d1-8c40-f18c82a6ccf5	https://app.midtrans.com/snap/v4/redirection/6d7eb85e-737f-48d1-8c40-f18c82a6ccf5	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 14:17:33.787	2025-09-01 14:17:33.787
522	RYLS557BLTUCJZ	c8325221-3b8e-44cc-9332-75ecde21bfc7	https://app.midtrans.com/snap/v4/redirection/c8325221-3b8e-44cc-9332-75ecde21bfc7	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 14:22:43.031	2025-09-01 14:22:43.031
523	RYLS558BGDTCY	9d6e9de8-f2ad-48a0-b4c3-7131e5df0cb8	https://app.midtrans.com/snap/v4/redirection/9d6e9de8-f2ad-48a0-b4c3-7131e5df0cb8	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 17:13:10.475	2025-09-01 17:13:10.475
524	RYLS559EFDYBTG	4494fbec-10bb-4cde-9585-d31a14dac96f	https://app.midtrans.com/snap/v4/redirection/4494fbec-10bb-4cde-9585-d31a14dac96f	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 17:15:19.672	2025-09-01 17:15:19.672
525	RYLS560VWDODRL	a424dd57-d0cf-49c1-9d1a-e26b8fc2f75f	https://app.midtrans.com/snap/v4/redirection/a424dd57-d0cf-49c1-9d1a-e26b8fc2f75f	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 17:27:21.695	2025-09-01 17:27:21.695
526	RYLS561UUFBT	9b3bc0e3-9754-4d07-a2c1-b0521b0e12e7	https://app.midtrans.com/snap/v4/redirection/9b3bc0e3-9754-4d07-a2c1-b0521b0e12e7	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 17:30:14.663	2025-09-01 17:30:14.663
527	RYLS562CYK	80183f72-37d8-43c0-9a79-353a151a1d5f	https://app.midtrans.com/snap/v4/redirection/80183f72-37d8-43c0-9a79-353a151a1d5f	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 19:16:16.019	2025-09-01 19:16:16.019
528	RYLS563ENDGEA	a996f967-3e4b-47cd-908b-7e26183ecb38	https://app.midtrans.com/snap/v4/redirection/a996f967-3e4b-47cd-908b-7e26183ecb38	\N	\N	246675	IDR	pending	\N	{}	{}	\N	\N	2025-09-01 23:55:44.358	2025-09-01 23:55:44.358
529	RYLS564BBDLKX	42867d6b-b1d3-4c0b-a997-3cd3c36d8871	https://app.midtrans.com/snap/v4/redirection/42867d6b-b1d3-4c0b-a997-3cd3c36d8871	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 03:25:14.542	2025-09-02 03:25:14.542
530	RYLS565DKB	c537c498-bad4-4233-85a0-f0834db10a52	https://app.midtrans.com/snap/v4/redirection/c537c498-bad4-4233-85a0-f0834db10a52	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 06:20:21.017	2025-09-02 06:20:21.017
531	RYLS566QEASLM	f68c2201-6049-432c-b404-70b678ae0bff	https://app.midtrans.com/snap/v4/redirection/f68c2201-6049-432c-b404-70b678ae0bff	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 06:53:02.557	2025-09-02 06:53:02.557
532	RYLS567USHVP	bccaa0d1-f89c-4f9e-9350-ff2deeb1b445	https://app.midtrans.com/snap/v4/redirection/bccaa0d1-f89c-4f9e-9350-ff2deeb1b445	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 07:45:18.025	2025-09-02 07:45:18.025
533	RYLS568IVAFB	575b13df-3e84-4c37-8900-2a128bef3a1c	https://app.midtrans.com/snap/v4/redirection/575b13df-3e84-4c37-8900-2a128bef3a1c	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 07:49:56.883	2025-09-02 07:49:56.883
534	RYLS569TERSXOZ	ae33b4d5-c1fe-4599-ad60-6f593b81541d	https://app.midtrans.com/snap/v4/redirection/ae33b4d5-c1fe-4599-ad60-6f593b81541d	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 08:05:10.762	2025-09-02 08:05:10.762
535	RYLS570EBDAZ	4054cb4b-7162-403c-8e82-73c16d1603cb	https://app.midtrans.com/snap/v4/redirection/4054cb4b-7162-403c-8e82-73c16d1603cb	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 08:06:31.574	2025-09-02 08:06:31.574
536	RYLS571WFGFU	f3a37a64-4fd9-4f60-9546-2b322c552df0	https://app.midtrans.com/snap/v4/redirection/f3a37a64-4fd9-4f60-9546-2b322c552df0	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 08:33:27.496	2025-09-02 08:33:27.496
537	RYLS572JXHYIV	e2d0e875-2cfa-465f-8305-86cabf4249c8	https://app.midtrans.com/snap/v4/redirection/e2d0e875-2cfa-465f-8305-86cabf4249c8	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 08:47:32.862	2025-09-02 08:47:32.862
538	RYLS573EVTUIG	de573efb-1f3f-4994-9e62-90f14fd55af0	https://app.midtrans.com/snap/v4/redirection/de573efb-1f3f-4994-9e62-90f14fd55af0	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 08:49:25.974	2025-09-02 08:49:25.974
539	RYLS574YTYYOKC	fc5b5f88-5d9d-46ec-86e8-ab703a2d98d7	https://app.midtrans.com/snap/v4/redirection/fc5b5f88-5d9d-46ec-86e8-ab703a2d98d7	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 09:39:42.111	2025-09-02 09:39:42.111
540	RYLS575MGCWO	d55d2b06-304c-45c7-83ae-8e9540804f87	https://app.midtrans.com/snap/v4/redirection/d55d2b06-304c-45c7-83ae-8e9540804f87	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 09:48:36.468	2025-09-02 09:48:36.468
541	RYLS576RBMWBE	48905f62-ae48-4ed3-82c7-09f0907471ae	https://app.midtrans.com/snap/v4/redirection/48905f62-ae48-4ed3-82c7-09f0907471ae	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 09:50:26.171	2025-09-02 09:50:26.171
542	RYLS577QLQQJD	6d2d84cc-334b-428d-aec4-70757bd00990	https://app.midtrans.com/snap/v4/redirection/6d2d84cc-334b-428d-aec4-70757bd00990	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 09:55:49.089	2025-09-02 09:55:49.089
543	RYLS578IVPHIR	09da08dd-9186-4cfd-9024-f74b0ea0b9f9	https://app.midtrans.com/snap/v4/redirection/09da08dd-9186-4cfd-9024-f74b0ea0b9f9	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 10:12:02.856	2025-09-02 10:12:02.856
544	RYLS579JJAUZ	0be83f43-d78d-43f7-b473-b8bc6696c4c2	https://app.midtrans.com/snap/v4/redirection/0be83f43-d78d-43f7-b473-b8bc6696c4c2	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 10:19:08.749	2025-09-02 10:19:08.749
545	RYLS580QZCIP	1cfc7a1d-b842-4a9b-b585-e054fa17346b	https://app.midtrans.com/snap/v4/redirection/1cfc7a1d-b842-4a9b-b585-e054fa17346b	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 10:51:07.047	2025-09-02 10:51:07.047
546	RYLS581NGDZF	3399eb82-b2d9-422b-a833-20a46e8e17ad	https://app.midtrans.com/snap/v4/redirection/3399eb82-b2d9-422b-a833-20a46e8e17ad	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 11:02:04.992	2025-09-02 11:02:04.992
547	RYLS582WAVJSS	cc0ee121-505e-4fb4-8ceb-baaae796c2dc	https://app.midtrans.com/snap/v4/redirection/cc0ee121-505e-4fb4-8ceb-baaae796c2dc	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 11:06:48.792	2025-09-02 11:06:48.792
548	RYLS583SCGROZ	bbf37ad8-1cb0-4d0f-aa43-472d7020f8d1	https://app.midtrans.com/snap/v4/redirection/bbf37ad8-1cb0-4d0f-aa43-472d7020f8d1	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 11:11:40.067	2025-09-02 11:11:40.067
549	RYLS584LJFYJTR	e77f6747-a752-469a-b56c-efe11bafe178	https://app.midtrans.com/snap/v4/redirection/e77f6747-a752-469a-b56c-efe11bafe178	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 11:20:29.909	2025-09-02 11:20:29.909
550	RYLS587UOEP	b1b3b8e9-4cc4-42b0-9645-1bb8a6437c02	https://app.midtrans.com/snap/v4/redirection/b1b3b8e9-4cc4-42b0-9645-1bb8a6437c02	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 11:57:26.362	2025-09-02 11:57:26.362
551	RYLS588KEQF	1230da21-ba84-40ee-822a-1ab7c9476ef6	https://app.midtrans.com/snap/v4/redirection/1230da21-ba84-40ee-822a-1ab7c9476ef6	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 12:38:53.595	2025-09-02 12:38:53.595
552	RYLS590SDRDZTMG	e54da460-563f-4c1b-b735-6199e2d60c90	https://app.midtrans.com/snap/v4/redirection/e54da460-563f-4c1b-b735-6199e2d60c90	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 13:21:23.215	2025-09-02 13:21:23.215
553	RYLS591BOTS	99499122-b3fe-4ab6-a248-8e9e9218ca0e	https://app.midtrans.com/snap/v4/redirection/99499122-b3fe-4ab6-a248-8e9e9218ca0e	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 14:18:50.822	2025-09-02 14:18:50.822
554	RYLS592BTLADBN	9303262c-f5ae-4c00-a4b3-5c335b884083	https://app.midtrans.com/snap/v4/redirection/9303262c-f5ae-4c00-a4b3-5c335b884083	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 14:49:32.845	2025-09-02 14:49:32.845
555	RYLS593BFZJXK	92958bed-21a3-43bd-8deb-10a129376054	https://app.midtrans.com/snap/v4/redirection/92958bed-21a3-43bd-8deb-10a129376054	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 14:58:30.847	2025-09-02 14:58:30.847
556	RYLS595BULVU	c24bf7d3-a254-435b-ac82-08cf64f8b719	https://app.midtrans.com/snap/v4/redirection/c24bf7d3-a254-435b-ac82-08cf64f8b719	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 15:40:00.997	2025-09-02 15:40:00.997
557	RYLS596QBQGG	fd5cea17-d88e-4bea-a642-645fbf08bb1c	https://app.midtrans.com/snap/v4/redirection/fd5cea17-d88e-4bea-a642-645fbf08bb1c	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 16:04:53.455	2025-09-02 16:04:53.455
558	RYLS597OCQN	38cb43d9-6c3d-48ec-9a5b-0d018d5c7097	https://app.midtrans.com/snap/v4/redirection/38cb43d9-6c3d-48ec-9a5b-0d018d5c7097	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 16:07:13.086	2025-09-02 16:07:13.086
559	RYLS598ZSOEZAR	6c36ca63-6d82-4629-8100-f0e731785f34	https://app.midtrans.com/snap/v4/redirection/6c36ca63-6d82-4629-8100-f0e731785f34	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 17:05:32.989	2025-09-02 17:05:32.989
560	RYLS599UIY	ef40585c-6480-4138-8b0a-0b5d8e503358	https://app.midtrans.com/snap/v4/redirection/ef40585c-6480-4138-8b0a-0b5d8e503358	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 17:07:34.774	2025-09-02 17:07:34.774
561	RYLS600ORQJWL	8c0afde3-dab3-464a-aa20-762d9b947f36	https://app.midtrans.com/snap/v4/redirection/8c0afde3-dab3-464a-aa20-762d9b947f36	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 17:59:44.869	2025-09-02 17:59:44.869
562	RYLS601IVOFV	900b454d-4f17-464c-9ece-f3cd9e8d2556	https://app.midtrans.com/snap/v4/redirection/900b454d-4f17-464c-9ece-f3cd9e8d2556	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 18:13:00.348	2025-09-02 18:13:00.348
563	RYLS602HRCTFB	27c9ca3f-939c-451b-8e6c-20035dd4b533	https://app.midtrans.com/snap/v4/redirection/27c9ca3f-939c-451b-8e6c-20035dd4b533	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 18:56:32.587	2025-09-02 18:56:32.587
564	RYLS604XLEDUU	0049c2e9-8c54-4a4e-b823-8ba6d8ba4756	https://app.midtrans.com/snap/v4/redirection/0049c2e9-8c54-4a4e-b823-8ba6d8ba4756	\N	\N	246657	IDR	pending	\N	{}	{}	\N	\N	2025-09-02 20:13:33.125	2025-09-02 20:13:33.125
565	RYLS605GPWLOB	52364232-0726-4a83-88a7-1a3ca86a4a0e	https://app.midtrans.com/snap/v4/redirection/52364232-0726-4a83-88a7-1a3ca86a4a0e	\N	\N	246225	IDR	pending	\N	{}	{}	\N	\N	2025-09-03 04:20:28.061	2025-09-03 04:20:28.061
566	RYLS606JIZN	0b96c955-68a8-46fa-af5c-3da4b7ec6d56	https://app.midtrans.com/snap/v4/redirection/0b96c955-68a8-46fa-af5c-3da4b7ec6d56	\N	\N	246225	IDR	pending	\N	{}	{}	\N	\N	2025-09-03 04:57:03.96	2025-09-03 04:57:03.96
567	RYLS607SSVGFZO	3e2a397e-aa7c-4e04-b49b-1ce5148efe02	https://app.midtrans.com/snap/v4/redirection/3e2a397e-aa7c-4e04-b49b-1ce5148efe02	\N	\N	246225	IDR	pending	\N	{}	{}	\N	\N	2025-09-03 05:45:39.448	2025-09-03 05:45:39.448
568	RYLS608ZZKPRID	0df7b30e-e146-4dd0-87c3-095e8705e452	https://app.midtrans.com/snap/v4/redirection/0df7b30e-e146-4dd0-87c3-095e8705e452	\N	\N	246225	IDR	pending	\N	{}	{}	\N	\N	2025-09-03 07:05:04.525	2025-09-03 07:05:04.525
569	RYLS611VATUQF	5fee2970-9fbf-4025-926a-b0b5f060abd2	https://app.midtrans.com/snap/v4/redirection/5fee2970-9fbf-4025-926a-b0b5f060abd2	\N	\N	246225	IDR	pending	\N	{}	{}	\N	\N	2025-09-03 08:29:42.596	2025-09-03 08:29:42.596
570	RYLS613AAMWZ	1705e2e8-5594-461a-b763-9af1094b4c47	https://app.midtrans.com/snap/v4/redirection/1705e2e8-5594-461a-b763-9af1094b4c47	\N	\N	246225	IDR	pending	\N	{}	{}	\N	\N	2025-09-03 09:48:09.978	2025-09-03 09:48:09.978
571	RYLS614SDAHOKM	d262c585-c28e-4774-b384-5eb94b2261e0	https://app.midtrans.com/snap/v4/redirection/d262c585-c28e-4774-b384-5eb94b2261e0	\N	\N	246225	IDR	pending	\N	{}	{}	\N	\N	2025-09-03 11:05:28.516	2025-09-03 11:05:28.516
572	RYLS615XVSWZE	17968fbe-9069-4c29-9e7d-b53842c48938	https://app.midtrans.com/snap/v4/redirection/17968fbe-9069-4c29-9e7d-b53842c48938	\N	\N	246082	IDR	pending	\N	{}	{}	\N	\N	2025-09-04 05:58:31.055	2025-09-04 05:58:31.055
573	RYLS616YIYWSI	0b5c00b2-71de-4216-a8de-2a2e2102b91e	https://app.midtrans.com/snap/v4/redirection/0b5c00b2-71de-4216-a8de-2a2e2102b91e	\N	\N	246082	IDR	pending	\N	{}	{}	\N	\N	2025-09-04 06:10:51.408	2025-09-04 06:10:51.408
574	RYLS617NDJMKJ	2ac62775-58dd-47bb-8ecc-f162d5e4ae28	https://app.midtrans.com/snap/v4/redirection/2ac62775-58dd-47bb-8ecc-f162d5e4ae28	\N	\N	246082	IDR	pending	\N	{}	{}	\N	\N	2025-09-04 09:04:25.292	2025-09-04 09:04:25.292
575	RYLS618YEFKN	b98e52b7-b50f-45c3-81aa-8549e0806c9f	https://app.midtrans.com/snap/v4/redirection/b98e52b7-b50f-45c3-81aa-8549e0806c9f	\N	\N	246082	IDR	pending	\N	{}	{}	\N	\N	2025-09-04 09:48:39.691	2025-09-04 09:48:39.691
576	RYLS619XNDPR	afb2405e-0b9e-48df-86ac-46077e3b21fc	https://app.midtrans.com/snap/v4/redirection/afb2405e-0b9e-48df-86ac-46077e3b21fc	\N	\N	246082	IDR	pending	\N	{}	{}	\N	\N	2025-09-04 11:30:00.997	2025-09-04 11:30:00.997
577	RYLS620OVHUP	8ed405ad-04a1-4533-9d01-246bdd14e10d	https://app.midtrans.com/snap/v4/redirection/8ed405ad-04a1-4533-9d01-246bdd14e10d	\N	\N	246082	IDR	pending	\N	{}	{}	\N	\N	2025-09-04 12:12:23.421	2025-09-04 12:12:23.421
578	RYLS621KBIH	3edf6671-8158-46cb-b8ca-76a63d5aa6ae	https://app.midtrans.com/snap/v4/redirection/3edf6671-8158-46cb-b8ca-76a63d5aa6ae	\N	\N	246082	IDR	pending	\N	{}	{}	\N	\N	2025-09-04 13:05:25.421	2025-09-04 13:05:25.421
579	RYLS622ZGDZ	3996a61e-6a8f-4f3f-80dd-7be163d88951	https://app.midtrans.com/snap/v4/redirection/3996a61e-6a8f-4f3f-80dd-7be163d88951	\N	\N	246082	IDR	pending	\N	{}	{}	\N	\N	2025-09-04 13:19:35.336	2025-09-04 13:19:35.336
580	RYLS623BJVKMB	1d33c1d5-c30d-46b2-b6ba-cc7fafa2b89e	https://app.midtrans.com/snap/v4/redirection/1d33c1d5-c30d-46b2-b6ba-cc7fafa2b89e	\N	\N	246082	IDR	pending	\N	{}	{}	\N	\N	2025-09-04 14:19:46.576	2025-09-04 14:19:46.576
581	RYLS624CHEQA	6352566c-0fff-4c05-864d-a7964a35897e	https://app.midtrans.com/snap/v4/redirection/6352566c-0fff-4c05-864d-a7964a35897e	\N	\N	246082	IDR	pending	\N	{}	{}	\N	\N	2025-09-04 17:30:11.578	2025-09-04 17:30:11.578
582	RYLS625VKILYLEZ	c5b1a507-e8d1-4f6a-9336-16df047fbb20	https://app.midtrans.com/snap/v4/redirection/c5b1a507-e8d1-4f6a-9336-16df047fbb20	\N	\N	246082	IDR	pending	\N	{}	{}	\N	\N	2025-09-04 20:10:50.161	2025-09-04 20:10:50.161
583	RYLS626OWJPSH	cecf0e85-3064-4c0b-ba2c-4e2e61962c1e	https://app.midtrans.com/snap/v4/redirection/cecf0e85-3064-4c0b-ba2c-4e2e61962c1e	\N	\N	246082	IDR	pending	\N	{}	{}	\N	\N	2025-09-04 22:22:52.707	2025-09-04 22:22:52.707
584	RYLS628SRIPU	13410997-4803-4899-aebd-74a5f7fa92df	https://app.midtrans.com/snap/v4/redirection/13410997-4803-4899-aebd-74a5f7fa92df	\N	\N	246169	IDR	pending	\N	{}	{}	\N	\N	2025-09-05 02:46:24.629	2025-09-05 02:46:24.629
585	RYLS629DNYGRNNU	e367a8e1-3b9e-48e9-9881-5a4974bd5a8c	https://app.midtrans.com/snap/v4/redirection/e367a8e1-3b9e-48e9-9881-5a4974bd5a8c	\N	\N	246169	IDR	pending	\N	{}	{}	\N	\N	2025-09-05 04:53:33.064	2025-09-05 04:53:33.064
586	RYLS630RNVRGIZ	a065719c-af1f-4174-ab5f-789ce6bf2bf9	https://app.midtrans.com/snap/v4/redirection/a065719c-af1f-4174-ab5f-789ce6bf2bf9	\N	\N	246169	IDR	pending	\N	{}	{}	\N	\N	2025-09-05 04:56:14.599	2025-09-05 04:56:14.599
587	RYLS631FPZAZDO	0159fecc-fe3a-4683-924a-2b2e19ce93bd	https://app.midtrans.com/snap/v4/redirection/0159fecc-fe3a-4683-924a-2b2e19ce93bd	\N	\N	246169	IDR	pending	\N	{}	{}	\N	\N	2025-09-05 06:06:18.675	2025-09-05 06:06:18.675
588	RYLS632ZIGVPQJ	85da22a3-6576-4901-b595-68a0f0aa6fb5	https://app.midtrans.com/snap/v4/redirection/85da22a3-6576-4901-b595-68a0f0aa6fb5	\N	\N	246169	IDR	pending	\N	{}	{}	\N	\N	2025-09-05 06:31:36.173	2025-09-05 06:31:36.173
589	RYLS633DXMNDF	a3b1f7fb-36d9-4860-ad1b-0ca02979fe7d	https://app.midtrans.com/snap/v4/redirection/a3b1f7fb-36d9-4860-ad1b-0ca02979fe7d	\N	\N	246169	IDR	pending	\N	{}	{}	\N	\N	2025-09-05 06:39:15.718	2025-09-05 06:39:15.718
590	RYLS635TBFXXG	432c957d-67d2-4603-b7fd-04173053da34	https://app.midtrans.com/snap/v4/redirection/432c957d-67d2-4603-b7fd-04173053da34	\N	\N	246169	IDR	pending	\N	{}	{}	\N	\N	2025-09-05 09:13:57.544	2025-09-05 09:13:57.544
591	RYLS636BWXBKZM	31989a60-441b-4eff-8df0-273738c6cbcd	https://app.midtrans.com/snap/v4/redirection/31989a60-441b-4eff-8df0-273738c6cbcd	\N	\N	246169	IDR	pending	\N	{}	{}	\N	\N	2025-09-05 10:22:21.998	2025-09-05 10:22:21.998
592	RYLS637YWPODH	02f2a103-e495-4b19-908e-5782670920b9	https://app.midtrans.com/snap/v4/redirection/02f2a103-e495-4b19-908e-5782670920b9	\N	\N	246169	IDR	pending	\N	{}	{}	\N	\N	2025-09-05 10:46:59.394	2025-09-05 10:46:59.394
593	RYLS638DDDHVV	073520ab-a218-43f2-931b-a12c3575527b	https://app.midtrans.com/snap/v4/redirection/073520ab-a218-43f2-931b-a12c3575527b	\N	\N	246169	IDR	pending	\N	{}	{}	\N	\N	2025-09-05 11:33:39.309	2025-09-05 11:33:39.309
594	RYLS639CXKLHJK	bebe21cd-e129-42d6-8f92-50e4ae93c88b	https://app.midtrans.com/snap/v4/redirection/bebe21cd-e129-42d6-8f92-50e4ae93c88b	\N	\N	246169	IDR	pending	\N	{}	{}	\N	\N	2025-09-05 13:10:24.447	2025-09-05 13:10:24.447
595	RYLS640QOLCYKV	be00b8b9-ee38-4375-b949-2aafb5871868	https://app.midtrans.com/snap/v4/redirection/be00b8b9-ee38-4375-b949-2aafb5871868	\N	\N	246169	IDR	pending	\N	{}	{}	\N	\N	2025-09-05 13:22:43.959	2025-09-05 13:22:43.959
596	RYLS641FOKVR	bd8ec023-ef49-4f6c-8a2a-01910665fed2	https://app.midtrans.com/snap/v4/redirection/bd8ec023-ef49-4f6c-8a2a-01910665fed2	\N	\N	246169	IDR	pending	\N	{}	{}	\N	\N	2025-09-05 15:44:53.165	2025-09-05 15:44:53.165
597	RYLS642ECWTGT	9b78c50d-0727-47fa-b9a7-90d9ef65e533	https://app.midtrans.com/snap/v4/redirection/9b78c50d-0727-47fa-b9a7-90d9ef65e533	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-06 10:00:28.475	2025-09-06 10:00:28.475
598	RYLS643NPUQKT	14f9f165-2e61-4bb7-9ffe-70b123e33bc1	https://app.midtrans.com/snap/v4/redirection/14f9f165-2e61-4bb7-9ffe-70b123e33bc1	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-06 10:50:58.807	2025-09-06 10:50:58.807
599	RYLS644NVZKVSM	7ac26615-32e6-47e8-a303-2744f34f7ddc	https://app.midtrans.com/snap/v4/redirection/7ac26615-32e6-47e8-a303-2744f34f7ddc	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-06 11:59:03.234	2025-09-06 11:59:03.234
600	RYLS645TXWGGBI	21a94244-ca51-41d7-abc6-c895adb67848	https://app.midtrans.com/snap/v4/redirection/21a94244-ca51-41d7-abc6-c895adb67848	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-06 13:42:31.185	2025-09-06 13:42:31.185
601	RYLS646BKIYFPT	3337ed61-05ed-4cc8-9d77-d727c6c7f871	https://app.midtrans.com/snap/v4/redirection/3337ed61-05ed-4cc8-9d77-d727c6c7f871	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-06 16:04:24.717	2025-09-06 16:04:24.717
602	RYLS647XWKWA	15cf302c-4084-42c4-888d-a42f922cda0d	https://app.midtrans.com/snap/v4/redirection/15cf302c-4084-42c4-888d-a42f922cda0d	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-06 16:29:13.038	2025-09-06 16:29:13.038
603	RYLS648XXVBWH	b46da387-2599-4381-b46e-16cad8476ef0	https://app.midtrans.com/snap/v4/redirection/b46da387-2599-4381-b46e-16cad8476ef0	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-06 19:32:16.413	2025-09-06 19:32:16.413
604	RYLS649CCGFQR	2953f5ed-b275-4b8d-9eaf-f8cd729b233d	https://app.midtrans.com/snap/v4/redirection/2953f5ed-b275-4b8d-9eaf-f8cd729b233d	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 02:20:22.658	2025-09-07 02:20:22.658
605	RYLS650JZOOOE	b14b18cc-0bba-4652-8e55-7cbd6bd337f4	https://app.midtrans.com/snap/v4/redirection/b14b18cc-0bba-4652-8e55-7cbd6bd337f4	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 04:18:47.95	2025-09-07 04:18:47.95
606	RYLS651CIMADSVR	f51991ad-556c-4903-a88b-44e27ae3e4ed	https://app.midtrans.com/snap/v4/redirection/f51991ad-556c-4903-a88b-44e27ae3e4ed	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 05:03:56.507	2025-09-07 05:03:56.507
607	RYLS652SOZXPH	4ea5019a-ae2d-4995-b014-0c7f71e6988a	https://app.midtrans.com/snap/v4/redirection/4ea5019a-ae2d-4995-b014-0c7f71e6988a	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 05:04:24.476	2025-09-07 05:04:24.476
608	RYLS653YTYNR	a61c4775-ed89-4335-9014-15a6a49050c7	https://app.midtrans.com/snap/v4/redirection/a61c4775-ed89-4335-9014-15a6a49050c7	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 07:14:20.694	2025-09-07 07:14:20.694
609	RYLS654HRBEBO	6d31ef03-89e3-4ada-814a-914e0ee8efb7	https://app.midtrans.com/snap/v4/redirection/6d31ef03-89e3-4ada-814a-914e0ee8efb7	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 07:35:03.837	2025-09-07 07:35:03.837
610	RYLS655LPFZHSO	6b0b6d1b-7122-4864-86f2-4402df1c2a23	https://app.midtrans.com/snap/v4/redirection/6b0b6d1b-7122-4864-86f2-4402df1c2a23	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 07:51:50.777	2025-09-07 07:51:50.777
611	RYLS656ZTOWXK	edf1663a-6241-41d4-aa2d-90e4534f4fbf	https://app.midtrans.com/snap/v4/redirection/edf1663a-6241-41d4-aa2d-90e4534f4fbf	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 10:03:43.972	2025-09-07 10:03:43.972
612	RYLS657EZOGDX	044a980e-f83c-4568-9c4d-93b2ba16b5da	https://app.midtrans.com/snap/v4/redirection/044a980e-f83c-4568-9c4d-93b2ba16b5da	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 10:16:10.221	2025-09-07 10:16:10.221
613	RYLS658BQNII	f47045de-ac47-49bd-8084-b210eac5a89b	https://app.midtrans.com/snap/v4/redirection/f47045de-ac47-49bd-8084-b210eac5a89b	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 10:39:32.47	2025-09-07 10:39:32.47
614	RYLS661LIZA	b792708d-4b92-4ec5-abd4-4bcda384805f	https://app.midtrans.com/snap/v4/redirection/b792708d-4b92-4ec5-abd4-4bcda384805f	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 12:29:41.947	2025-09-07 12:29:41.947
615	RYLS663CHFPB	07e4f77a-6942-4fc6-afbd-a3d460341ec2	https://app.midtrans.com/snap/v4/redirection/07e4f77a-6942-4fc6-afbd-a3d460341ec2	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 14:30:49.189	2025-09-07 14:30:49.189
616	RYLS664RPQQLFJY	7afe9fd4-3f57-46b3-bde0-3db297881e09	https://app.midtrans.com/snap/v4/redirection/7afe9fd4-3f57-46b3-bde0-3db297881e09	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 15:15:11.147	2025-09-07 15:15:11.147
617	RYLS665KJOXYKT	b9b54b9f-84a8-4312-a78f-2ea7716b6fc1	https://app.midtrans.com/snap/v4/redirection/b9b54b9f-84a8-4312-a78f-2ea7716b6fc1	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 15:15:55.293	2025-09-07 15:15:55.293
618	RYLS666ZBRYS	744f2117-687c-4166-86b6-9c1c5e5bb37a	https://app.midtrans.com/snap/v4/redirection/744f2117-687c-4166-86b6-9c1c5e5bb37a	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 15:44:15.848	2025-09-07 15:44:15.848
619	RYLS667JLFAALQI	6ff92bbd-9262-4852-8a83-2848c1945b55	https://app.midtrans.com/snap/v4/redirection/6ff92bbd-9262-4852-8a83-2848c1945b55	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 15:49:20.67	2025-09-07 15:49:20.67
620	RYLS668RFHYC	fdeecd09-13cf-4ec8-9e5a-73cfc5808415	https://app.midtrans.com/snap/v4/redirection/fdeecd09-13cf-4ec8-9e5a-73cfc5808415	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 19:09:35.947	2025-09-07 19:09:35.947
621	RYLS670OAIDY	ce25b337-dcb2-4465-b290-17f5ed50e280	https://app.midtrans.com/snap/v4/redirection/ce25b337-dcb2-4465-b290-17f5ed50e280	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 20:42:49.275	2025-09-07 20:42:49.275
622	RYLS671OOSDU	5b30e5ad-fcb2-4d1f-9f4e-cd699d98b87f	https://app.midtrans.com/snap/v4/redirection/5b30e5ad-fcb2-4d1f-9f4e-cd699d98b87f	\N	\N	246356	IDR	pending	\N	{}	{}	\N	\N	2025-09-07 20:58:10.405	2025-09-07 20:58:10.405
623	RYLS672CZRYO	b10e1465-e5bf-497e-9b76-c9cb14a2bada	https://app.midtrans.com/snap/v4/redirection/b10e1465-e5bf-497e-9b76-c9cb14a2bada	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 02:01:23.902	2025-09-08 02:01:23.902
624	RYLS673WCJXR	d1810452-7d0a-42c5-8613-91f52a199705	https://app.midtrans.com/snap/v4/redirection/d1810452-7d0a-42c5-8613-91f52a199705	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 02:17:47.271	2025-09-08 02:17:47.271
625	RYLS674TCMYOZC	1beb6fbd-b7e6-4817-a8c5-e6698879208b	https://app.midtrans.com/snap/v4/redirection/1beb6fbd-b7e6-4817-a8c5-e6698879208b	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 04:18:44.216	2025-09-08 04:18:44.216
626	RYLS675LRGAQXB	ba183344-22cc-4ce2-b7fa-bcae603147e3	https://app.midtrans.com/snap/v4/redirection/ba183344-22cc-4ce2-b7fa-bcae603147e3	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 05:02:50.93	2025-09-08 05:02:50.93
627	RYLS676FMEY	e6208e4e-c452-4ff5-936e-a9971c6a173e	https://app.midtrans.com/snap/v4/redirection/e6208e4e-c452-4ff5-936e-a9971c6a173e	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 07:39:02.49	2025-09-08 07:39:02.49
628	RYLS677FFSFX	e898b13a-2b43-4d35-84a9-5e3dd6200bd8	https://app.midtrans.com/snap/v4/redirection/e898b13a-2b43-4d35-84a9-5e3dd6200bd8	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 08:04:53.495	2025-09-08 08:04:53.495
629	RYLS678YUGYC	69cb3778-50b5-4a0e-9714-1b8d9065677b	https://app.midtrans.com/snap/v4/redirection/69cb3778-50b5-4a0e-9714-1b8d9065677b	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 08:07:04.25	2025-09-08 08:07:04.25
630	RYLS679DNDXZEJ	8e55f794-6a46-4bf2-8b45-1528428bf18d	https://app.midtrans.com/snap/v4/redirection/8e55f794-6a46-4bf2-8b45-1528428bf18d	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 08:28:17.195	2025-09-08 08:28:17.195
631	RYLS680MPQJL	d6f328ce-8ea2-4fa2-be11-241089ab081f	https://app.midtrans.com/snap/v4/redirection/d6f328ce-8ea2-4fa2-be11-241089ab081f	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 08:30:17.831	2025-09-08 08:30:17.831
632	RYLS681DXRTSYYX	66b1235d-19b7-4dfa-9816-000bcca31671	https://app.midtrans.com/snap/v4/redirection/66b1235d-19b7-4dfa-9816-000bcca31671	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 09:20:44.931	2025-09-08 09:20:44.931
633	RYLS683IUTMUK	24007884-ef00-48db-bdfa-f18f7d9d9af6	https://app.midtrans.com/snap/v4/redirection/24007884-ef00-48db-bdfa-f18f7d9d9af6	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 10:34:40.228	2025-09-08 10:34:40.228
634	RYLS684GJDDAZ	670359a1-8a71-47af-8727-134d32866e88	https://app.midtrans.com/snap/v4/redirection/670359a1-8a71-47af-8727-134d32866e88	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 10:35:15.974	2025-09-08 10:35:15.974
635	RYLS685WXSGGWD	d784012a-c784-46af-9fb4-a3aa153308fa	https://app.midtrans.com/snap/v4/redirection/d784012a-c784-46af-9fb4-a3aa153308fa	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 10:40:15.207	2025-09-08 10:40:15.207
636	RYLS686KFNSHO	49a37c7c-e590-414b-baf6-e599fef87c35	https://app.midtrans.com/snap/v4/redirection/49a37c7c-e590-414b-baf6-e599fef87c35	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 11:33:43.158	2025-09-08 11:33:43.158
637	RYLS687GJFQ	16038b73-ba1b-42b8-b43f-2ecbaf879c76	https://app.midtrans.com/snap/v4/redirection/16038b73-ba1b-42b8-b43f-2ecbaf879c76	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 12:34:44.052	2025-09-08 12:34:44.052
638	RYLS688VLJSEMB	a5612a3a-19ea-4ab8-a883-21a02ce3f064	https://app.midtrans.com/snap/v4/redirection/a5612a3a-19ea-4ab8-a883-21a02ce3f064	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 13:27:45.647	2025-09-08 13:27:45.647
639	RYLS689VNOHZ	94b3518a-e200-4247-92ec-d4d3b7fd1968	https://app.midtrans.com/snap/v4/redirection/94b3518a-e200-4247-92ec-d4d3b7fd1968	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 15:42:53.428	2025-09-08 15:42:53.428
640	RYLS690HTIDAQ	4b4e501b-092c-4e3b-b9a7-48c4161309e4	https://app.midtrans.com/snap/v4/redirection/4b4e501b-092c-4e3b-b9a7-48c4161309e4	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 18:09:24.113	2025-09-08 18:09:24.113
641	RYLS691FHZ	6aad4c69-8b69-4a2c-a424-227cea0db56f	https://app.midtrans.com/snap/v4/redirection/6aad4c69-8b69-4a2c-a424-227cea0db56f	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 18:32:04.977	2025-09-08 18:32:04.977
642	RYLS692DKWZDFRM	a9adf7d6-f4bc-4eed-935f-41b63990ee99	https://app.midtrans.com/snap/v4/redirection/a9adf7d6-f4bc-4eed-935f-41b63990ee99	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 19:13:07.89	2025-09-08 19:13:07.89
643	RYLS693BLZWYSD	ffe1d8b2-4902-4be3-9e1e-7fa0c617ec56	https://app.midtrans.com/snap/v4/redirection/ffe1d8b2-4902-4be3-9e1e-7fa0c617ec56	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 19:18:06.482	2025-09-08 19:18:06.482
644	RYLS694CTFXAJ	015374e0-0f4e-4520-bca8-363b62de6b78	https://app.midtrans.com/snap/v4/redirection/015374e0-0f4e-4520-bca8-363b62de6b78	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 19:23:08.379	2025-09-08 19:23:08.379
645	RYLS695WOOFWB	4aab6fb6-ec5c-4756-aacf-83c2016ab9f9	https://app.midtrans.com/snap/v4/redirection/4aab6fb6-ec5c-4756-aacf-83c2016ab9f9	\N	\N	246268	IDR	pending	\N	{}	{}	\N	\N	2025-09-08 20:05:33.186	2025-09-08 20:05:33.186
646	RYLS696TYREAHB	20437251-a1c9-4f28-90ff-43ec5e5d3bea	https://app.midtrans.com/snap/v4/redirection/20437251-a1c9-4f28-90ff-43ec5e5d3bea	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 00:22:11.094	2025-09-09 00:22:11.094
647	RYLS698CEZADCZ	bc478dfa-b1d6-4afb-86ee-98ef3e141f04	https://app.midtrans.com/snap/v4/redirection/bc478dfa-b1d6-4afb-86ee-98ef3e141f04	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 05:02:43.371	2025-09-09 05:02:43.371
648	RYLS699HLBY	41e01934-eda0-42bc-a4c1-4ab8e1897ea5	https://app.midtrans.com/snap/v4/redirection/41e01934-eda0-42bc-a4c1-4ab8e1897ea5	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 06:17:24.571	2025-09-09 06:17:24.571
649	RYLS700SFITRZ	80e5a06b-802f-4ca6-b426-0dbe8809ba2b	https://app.midtrans.com/snap/v4/redirection/80e5a06b-802f-4ca6-b426-0dbe8809ba2b	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 07:00:02.896	2025-09-09 07:00:02.896
650	RYLS701FNQOLF	094c3364-d79f-4f7b-8b93-6bacd54ad4d4	https://app.midtrans.com/snap/v4/redirection/094c3364-d79f-4f7b-8b93-6bacd54ad4d4	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 07:13:41.532	2025-09-09 07:13:41.532
651	RYLS702HLWJF	49902aed-749c-41f9-b7d8-07bc4bd36cf4	https://app.midtrans.com/snap/v4/redirection/49902aed-749c-41f9-b7d8-07bc4bd36cf4	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 08:44:55.503	2025-09-09 08:44:55.503
652	RYLS703PILSALU	f2c82956-5bfa-4809-91c6-fe97a205caca	https://app.midtrans.com/snap/v4/redirection/f2c82956-5bfa-4809-91c6-fe97a205caca	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 08:46:52.79	2025-09-09 08:46:52.79
653	RYLS704LRWCZYO	c342c329-7bce-4835-8815-4838e17d211a	https://app.midtrans.com/snap/v4/redirection/c342c329-7bce-4835-8815-4838e17d211a	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 08:56:48.079	2025-09-09 08:56:48.079
654	RYLS705BJXZAFQ	88d4607e-18ae-44ce-92a1-e71ac24540ce	https://app.midtrans.com/snap/v4/redirection/88d4607e-18ae-44ce-92a1-e71ac24540ce	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 09:11:28.663	2025-09-09 09:11:28.663
655	RYLS706GUPQL	83faf053-fee2-467d-8544-64f5e96ff6f0	https://app.midtrans.com/snap/v4/redirection/83faf053-fee2-467d-8544-64f5e96ff6f0	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 13:09:34.113	2025-09-09 13:09:34.113
656	RYLS707UWXKOB	744458cc-3579-4e4a-8024-6a6a698f3f84	https://app.midtrans.com/snap/v4/redirection/744458cc-3579-4e4a-8024-6a6a698f3f84	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 15:07:10.744	2025-09-09 15:07:10.744
657	RYLS708KZFIXKIG	22fe492e-4820-4bf9-8be9-ff480147fbc2	https://app.midtrans.com/snap/v4/redirection/22fe492e-4820-4bf9-8be9-ff480147fbc2	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 15:15:13.856	2025-09-09 15:15:13.856
658	RYLS709ERXMDTHY	e2df1fec-be7c-4c90-8aa4-5c9c18fb56ba	https://app.midtrans.com/snap/v4/redirection/e2df1fec-be7c-4c90-8aa4-5c9c18fb56ba	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 19:06:05.901	2025-09-09 19:06:05.901
659	RYLS710NNHCX	58adb7a8-6fc4-4efe-8035-ff2b42db1ddd	https://app.midtrans.com/snap/v4/redirection/58adb7a8-6fc4-4efe-8035-ff2b42db1ddd	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 19:41:16.925	2025-09-09 19:41:16.925
660	RYLS711IWTOJF	1bc39a2c-0bbf-4768-80e2-a0e4eba987e3	https://app.midtrans.com/snap/v4/redirection/1bc39a2c-0bbf-4768-80e2-a0e4eba987e3	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 22:54:29.022	2025-09-09 22:54:29.022
661	RYLS712DHUV	d36be4ae-5f92-4662-a822-9b25dc659856	https://app.midtrans.com/snap/v4/redirection/d36be4ae-5f92-4662-a822-9b25dc659856	\N	\N	246425	IDR	pending	\N	{}	{}	\N	\N	2025-09-09 22:57:27.002	2025-09-09 22:57:27.002
662	RYLS713TZYLDS	bed4e250-79a2-4853-b9c9-f10e09165386	https://app.midtrans.com/snap/v4/redirection/bed4e250-79a2-4853-b9c9-f10e09165386	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 04:08:03.434	2025-09-10 04:08:03.434
663	RYLS714JTFZY	dd9ac13d-d717-4f59-ba2d-b40eccc6d180	https://app.midtrans.com/snap/v4/redirection/dd9ac13d-d717-4f59-ba2d-b40eccc6d180	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 04:16:45.103	2025-09-10 04:16:45.103
664	RYLS715BDA	70bb2aa3-f09e-4559-82c3-538b8ac9b2a7	https://app.midtrans.com/snap/v4/redirection/70bb2aa3-f09e-4559-82c3-538b8ac9b2a7	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 04:33:38.251	2025-09-10 04:33:38.251
665	RYLS716UXQK	f1fdfac9-6fb1-47f8-8cfe-106b07b3c4d3	https://app.midtrans.com/snap/v4/redirection/f1fdfac9-6fb1-47f8-8cfe-106b07b3c4d3	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 07:07:44.882	2025-09-10 07:07:44.882
666	RYLS717FCBCCGA	73bc7c27-00e4-495f-8246-86110d481060	https://app.midtrans.com/snap/v4/redirection/73bc7c27-00e4-495f-8246-86110d481060	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 12:06:12.611	2025-09-10 12:06:12.611
667	RYLS718TZUUK	9fc965a1-2150-4e06-8bf8-5f88b6d5b97f	https://app.midtrans.com/snap/v4/redirection/9fc965a1-2150-4e06-8bf8-5f88b6d5b97f	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 12:10:50.451	2025-09-10 12:10:50.451
668	RYLS719ZVHBDB	d971297e-b55e-404e-983b-04c0b9da6d80	https://app.midtrans.com/snap/v4/redirection/d971297e-b55e-404e-983b-04c0b9da6d80	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 13:38:44.87	2025-09-10 13:38:44.87
669	RYLS720EKEJI	700d1932-dbb6-4017-93f0-a66399b3224d	https://app.midtrans.com/snap/v4/redirection/700d1932-dbb6-4017-93f0-a66399b3224d	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 15:21:21.487	2025-09-10 15:21:21.487
670	RYLS721JBWXSX	a21dc61c-71d6-4a10-a81a-b9ac19027d9b	https://app.midtrans.com/snap/v4/redirection/a21dc61c-71d6-4a10-a81a-b9ac19027d9b	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 15:26:05.173	2025-09-10 15:26:05.173
671	RYLS722DGAAH	a7681c38-426c-4f5d-80df-978e94465252	https://app.midtrans.com/snap/v4/redirection/a7681c38-426c-4f5d-80df-978e94465252	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 15:28:08.853	2025-09-10 15:28:08.853
672	RYLS723NFOBCO	8e2168bf-3709-46de-8ba8-8141cf7778d4	https://app.midtrans.com/snap/v4/redirection/8e2168bf-3709-46de-8ba8-8141cf7778d4	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 15:31:21.985	2025-09-10 15:31:21.985
673	RYLS724JHOU	e17cd661-37b7-41d7-885c-182f5ff36071	https://app.midtrans.com/snap/v4/redirection/e17cd661-37b7-41d7-885c-182f5ff36071	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 15:41:41.82	2025-09-10 15:41:41.82
674	RYLS725EDBUP	6e2d3fd0-8f4a-4b20-a0e0-077b0a47ce6b	https://app.midtrans.com/snap/v4/redirection/6e2d3fd0-8f4a-4b20-a0e0-077b0a47ce6b	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 16:28:54.44	2025-09-10 16:28:54.44
675	RYLS726XVHI	6a8c9834-91cf-441e-8fe8-5d1d60a54184	https://app.midtrans.com/snap/v4/redirection/6a8c9834-91cf-441e-8fe8-5d1d60a54184	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 16:39:28.478	2025-09-10 16:39:28.478
676	RYLS727AYAY	1ef52bdc-6cb3-4d24-82a0-39ca5d2b3104	https://app.midtrans.com/snap/v4/redirection/1ef52bdc-6cb3-4d24-82a0-39ca5d2b3104	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 16:51:04.273	2025-09-10 16:51:04.273
677	RYLS728MSTL	452c0543-5ef2-42c3-b1d7-c095e71beae0	https://app.midtrans.com/snap/v4/redirection/452c0543-5ef2-42c3-b1d7-c095e71beae0	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 16:54:55.228	2025-09-10 16:54:55.228
678	RYLS729PJFMVI	1b147d0c-f237-4dc0-bfe5-22dabb1e7bfc	https://app.midtrans.com/snap/v4/redirection/1b147d0c-f237-4dc0-bfe5-22dabb1e7bfc	\N	\N	246305	IDR	pending	\N	{}	{}	\N	\N	2025-09-10 17:27:21.843	2025-09-10 17:27:21.843
679	RYLS731ADHW	7ec06a5b-67e0-4682-88f0-6ea29a3b6b51	https://app.midtrans.com/snap/v4/redirection/7ec06a5b-67e0-4682-88f0-6ea29a3b6b51	\N	\N	246584	IDR	pending	\N	{}	{}	\N	\N	2025-09-11 02:12:00.419	2025-09-11 02:12:00.419
680	RYLS732NQJUTYJF	aa76411a-b09f-4e37-a35c-e32d1eab9ab5	https://app.midtrans.com/snap/v4/redirection/aa76411a-b09f-4e37-a35c-e32d1eab9ab5	\N	\N	246584	IDR	pending	\N	{}	{}	\N	\N	2025-09-11 03:22:39.532	2025-09-11 03:22:39.532
681	RYLS733QSFM	0a5b6a2b-ac72-4622-9467-3d16f5aa960a	https://app.midtrans.com/snap/v4/redirection/0a5b6a2b-ac72-4622-9467-3d16f5aa960a	\N	\N	246584	IDR	pending	\N	{}	{}	\N	\N	2025-09-11 05:04:04.891	2025-09-11 05:04:04.891
682	RYLS734THOLG	e01590fc-76b2-4819-9751-a52b3fed1075	https://app.midtrans.com/snap/v4/redirection/e01590fc-76b2-4819-9751-a52b3fed1075	\N	\N	246584	IDR	pending	\N	{}	{}	\N	\N	2025-09-11 06:56:46.651	2025-09-11 06:56:46.651
683	RYLS735MDKETR	64d4eb7c-37f9-443f-87cc-64ec19b4dc60	https://app.midtrans.com/snap/v4/redirection/64d4eb7c-37f9-443f-87cc-64ec19b4dc60	\N	\N	246584	IDR	pending	\N	{}	{}	\N	\N	2025-09-11 07:30:33.784	2025-09-11 07:30:33.784
684	RYLS736LXUJ	f0aae0ca-4f88-4f5b-9022-b5dcdddd5b60	https://app.midtrans.com/snap/v4/redirection/f0aae0ca-4f88-4f5b-9022-b5dcdddd5b60	\N	\N	246584	IDR	pending	\N	{}	{}	\N	\N	2025-09-11 07:32:23.313	2025-09-11 07:32:23.313
685	RYLS737ZVXEXB	3e49ad7d-fac3-4d30-9eca-4c060be290cb	https://app.midtrans.com/snap/v4/redirection/3e49ad7d-fac3-4d30-9eca-4c060be290cb	\N	\N	246584	IDR	pending	\N	{}	{}	\N	\N	2025-09-11 07:39:39.91	2025-09-11 07:39:39.91
686	RYLS738BKEFYF	c16ee299-d5cc-4271-8b01-12d6ae4e0f98	https://app.midtrans.com/snap/v4/redirection/c16ee299-d5cc-4271-8b01-12d6ae4e0f98	\N	\N	246584	IDR	pending	\N	{}	{}	\N	\N	2025-09-11 08:05:33.818	2025-09-11 08:05:33.818
687	RYLS739AKNDPKK	6a552922-1217-466e-a436-65a5ad45ef5c	https://app.midtrans.com/snap/v4/redirection/6a552922-1217-466e-a436-65a5ad45ef5c	\N	\N	246584	IDR	pending	\N	{}	{}	\N	\N	2025-09-11 12:28:15.398	2025-09-11 12:28:15.398
688	RYLS741CUXUKI	04ef6f75-afc9-4455-8526-c45e0de10491	https://app.midtrans.com/snap/v4/redirection/04ef6f75-afc9-4455-8526-c45e0de10491	\N	\N	246584	IDR	pending	\N	{}	{}	\N	\N	2025-09-11 13:45:16.394	2025-09-11 13:45:16.394
689	RYLS742YNCMX	ea32fa3d-8d6f-4e11-a999-b3e6fcc7eb9f	https://app.midtrans.com/snap/v4/redirection/ea32fa3d-8d6f-4e11-a999-b3e6fcc7eb9f	\N	\N	246584	IDR	pending	\N	{}	{}	\N	\N	2025-09-11 13:46:41.894	2025-09-11 13:46:41.894
690	RYLS743FCJEJ	a1f7ba93-492b-46f1-a791-0d8b5e78b70f	https://app.midtrans.com/snap/v4/redirection/a1f7ba93-492b-46f1-a791-0d8b5e78b70f	\N	\N	246584	IDR	pending	\N	{}	{}	\N	\N	2025-09-11 13:47:32.163	2025-09-11 13:47:32.163
691	RYLS745KNNP	870d4aa0-7345-4b0e-8289-2155fa566c16	https://app.midtrans.com/snap/v4/redirection/870d4aa0-7345-4b0e-8289-2155fa566c16	\N	\N	246584	IDR	pending	\N	{}	{}	\N	\N	2025-09-11 16:45:11.336	2025-09-11 16:45:11.336
692	RYLS746ZDLIAI	b50af81e-07c9-4778-8dee-f15a57d2809b	https://app.midtrans.com/snap/v4/redirection/b50af81e-07c9-4778-8dee-f15a57d2809b	\N	\N	246584	IDR	pending	\N	{}	{}	\N	\N	2025-09-11 19:43:01.564	2025-09-11 19:43:01.564
693	RYLS748XDWE	280859a7-bd1c-4bad-b756-7455f04da524	https://app.midtrans.com/snap/v4/redirection/280859a7-bd1c-4bad-b756-7455f04da524	\N	\N	246239	IDR	pending	\N	{}	{}	\N	\N	2025-09-12 13:16:12.253	2025-09-12 13:16:12.253
694	RYLS749FVEH	91d3a31a-5b92-4854-b0b4-a2e442e9130b	https://app.midtrans.com/snap/v4/redirection/91d3a31a-5b92-4854-b0b4-a2e442e9130b	\N	\N	246239	IDR	pending	\N	{}	{}	\N	\N	2025-09-12 21:20:14.565	2025-09-12 21:20:14.565
695	RYLS750XKPXAP	7b80fc52-9fe7-453d-8380-e84e5e0ed185	https://app.midtrans.com/snap/v4/redirection/7b80fc52-9fe7-453d-8380-e84e5e0ed185	\N	\N	246239	IDR	pending	\N	{}	{}	\N	\N	2025-09-12 21:59:57.324	2025-09-12 21:59:57.324
696	RYLS751QXNMWD	90a38eaa-dee3-4199-aa23-5a1383406e34	https://app.midtrans.com/snap/v4/redirection/90a38eaa-dee3-4199-aa23-5a1383406e34	\N	\N	246239	IDR	pending	\N	{}	{}	\N	\N	2025-09-12 22:05:29.94	2025-09-12 22:05:29.94
697	RYLS752EGYXX	3a5a7ce9-7c45-477e-9f8d-9467cd7bc361	https://app.midtrans.com/snap/v4/redirection/3a5a7ce9-7c45-477e-9f8d-9467cd7bc361	\N	\N	246239	IDR	pending	\N	{}	{}	\N	\N	2025-09-12 22:12:40.418	2025-09-12 22:12:40.418
698	RYLS753CWYKLFS	417744a2-ef91-4e4e-a055-8cd0a1c247f9	https://app.midtrans.com/snap/v4/redirection/417744a2-ef91-4e4e-a055-8cd0a1c247f9	\N	\N	246239	IDR	pending	\N	{}	{}	\N	\N	2025-09-12 22:23:15.738	2025-09-12 22:23:15.738
699	RYLS754LCSAHQR	e0e7424d-aa89-4003-b099-9e615fb3e38e	https://app.midtrans.com/snap/v4/redirection/e0e7424d-aa89-4003-b099-9e615fb3e38e	\N	\N	246239	IDR	pending	\N	{}	{}	\N	\N	2025-09-12 23:14:15.653	2025-09-12 23:14:15.653
700	RYLS755DHYAN	733885ee-f3a5-466d-9f22-1d13a9892893	https://app.midtrans.com/snap/v4/redirection/733885ee-f3a5-466d-9f22-1d13a9892893	\N	\N	245452	IDR	pending	\N	{}	{}	\N	\N	2025-09-13 03:31:59.71	2025-09-13 03:31:59.71
701	RYLS757PQJQGM	e6eee126-836b-434a-90f9-1676c5c7aad7	https://app.midtrans.com/snap/v4/redirection/e6eee126-836b-434a-90f9-1676c5c7aad7	\N	\N	245452	IDR	pending	\N	{}	{}	\N	\N	2025-09-13 05:16:00.433	2025-09-13 05:16:00.433
702	RYLS758JTRMFHO	2b8a7067-c947-440d-9b44-f8b7e20b4284	https://app.midtrans.com/snap/v4/redirection/2b8a7067-c947-440d-9b44-f8b7e20b4284	\N	\N	245452	IDR	pending	\N	{}	{}	\N	\N	2025-09-13 06:13:01.496	2025-09-13 06:13:01.496
703	RYLS759CCXUZJ	ce7c2df7-1029-4e98-ba13-dde219b0665a	https://app.midtrans.com/snap/v4/redirection/ce7c2df7-1029-4e98-ba13-dde219b0665a	\N	\N	245452	IDR	pending	\N	{}	{}	\N	\N	2025-09-13 08:05:33.836	2025-09-13 08:05:33.836
704	RYLS760GLBGF	2d967ed6-bfd3-4af4-b38f-ef4a30a4280e	https://app.midtrans.com/snap/v4/redirection/2d967ed6-bfd3-4af4-b38f-ef4a30a4280e	\N	\N	245452	IDR	pending	\N	{}	{}	\N	\N	2025-09-13 08:10:46.141	2025-09-13 08:10:46.141
705	RYLS761MIIKDDB	373a35ff-599a-45b2-99db-546763da6bfb	https://app.midtrans.com/snap/v4/redirection/373a35ff-599a-45b2-99db-546763da6bfb	\N	\N	245452	IDR	pending	\N	{}	{}	\N	\N	2025-09-13 08:53:47.933	2025-09-13 08:53:47.933
706	RYLS762GDSLNSP	7865db80-eebe-4bbe-98d1-a9586fcd946f	https://app.midtrans.com/snap/v4/redirection/7865db80-eebe-4bbe-98d1-a9586fcd946f	\N	\N	245452	IDR	pending	\N	{}	{}	\N	\N	2025-09-13 09:17:06.026	2025-09-13 09:17:06.026
707	RYLS763UOTJKYA	60c81392-1481-464d-acff-234fcdc674fd	https://app.midtrans.com/snap/v4/redirection/60c81392-1481-464d-acff-234fcdc674fd	\N	\N	245452	IDR	pending	\N	{}	{}	\N	\N	2025-09-13 09:23:55.855	2025-09-13 09:23:55.855
708	RYLS764LOKXO	5e8d101d-4dc9-4e29-8fef-e96b89752b45	https://app.midtrans.com/snap/v4/redirection/5e8d101d-4dc9-4e29-8fef-e96b89752b45	\N	\N	245452	IDR	pending	\N	{}	{}	\N	\N	2025-09-13 10:25:32.339	2025-09-13 10:25:32.339
709	RYLS765FJKZP	8e47f1b3-294e-46f0-a093-74abd3fcf8fb	https://app.midtrans.com/snap/v4/redirection/8e47f1b3-294e-46f0-a093-74abd3fcf8fb	\N	\N	245452	IDR	pending	\N	{}	{}	\N	\N	2025-09-13 15:40:58.423	2025-09-13 15:40:58.423
710	RYLS766GNCES	12a5f641-9731-4ea1-81ca-7ec5df5cc3eb	https://app.midtrans.com/snap/v4/redirection/12a5f641-9731-4ea1-81ca-7ec5df5cc3eb	\N	\N	245452	IDR	pending	\N	{}	{}	\N	\N	2025-09-13 17:04:38.623	2025-09-13 17:04:38.623
711	RYLS767DBEYOMEI	6f84c641-ec3c-4199-9eaf-ac8addb2aaf6	https://app.midtrans.com/snap/v4/redirection/6f84c641-ec3c-4199-9eaf-ac8addb2aaf6	\N	\N	245452	IDR	pending	\N	{}	{}	\N	\N	2025-09-13 21:45:57.359	2025-09-13 21:45:57.359
712	RYLS768VVZVKOT	288333ea-487c-4c63-8264-35654db705d0	https://app.midtrans.com/snap/v4/redirection/288333ea-487c-4c63-8264-35654db705d0	\N	\N	245452	IDR	pending	\N	{}	{}	\N	\N	2025-09-13 23:17:48.958	2025-09-13 23:17:48.958
713	RYLS769BWGIND	220ca833-9da9-4790-b1c5-680ce899e36e	https://app.midtrans.com/snap/v4/redirection/220ca833-9da9-4790-b1c5-680ce899e36e	\N	\N	245439	IDR	pending	\N	{}	{}	\N	\N	2025-09-14 01:09:50.112	2025-09-14 01:09:50.112
714	RYLS770OTW	9cc70ab5-4d4f-4a35-a60d-f682e8b3770a	https://app.midtrans.com/snap/v4/redirection/9cc70ab5-4d4f-4a35-a60d-f682e8b3770a	\N	\N	245439	IDR	pending	\N	{}	{}	\N	\N	2025-09-14 01:16:55.043	2025-09-14 01:16:55.043
715	RYLS772RVYDQCS	25941b22-e1b0-45e0-84f2-d395cee170ac	https://app.midtrans.com/snap/v4/redirection/25941b22-e1b0-45e0-84f2-d395cee170ac	\N	\N	245439	IDR	pending	\N	{}	{}	\N	\N	2025-09-14 04:34:13.391	2025-09-14 04:34:13.391
716	RYLS773ECSE	27b98c7c-da1f-4052-ac11-e0c663602991	https://app.midtrans.com/snap/v4/redirection/27b98c7c-da1f-4052-ac11-e0c663602991	\N	\N	245439	IDR	pending	\N	{}	{}	\N	\N	2025-09-14 06:11:37.737	2025-09-14 06:11:37.737
717	RYLS774NGCFWAD	2cc18fed-3bf3-46cc-a499-21406d7ba990	https://app.midtrans.com/snap/v4/redirection/2cc18fed-3bf3-46cc-a499-21406d7ba990	\N	\N	245439	IDR	pending	\N	{}	{}	\N	\N	2025-09-14 06:14:58.146	2025-09-14 06:14:58.146
718	RYLS775XVEZYL	a651fb50-e0ea-45d2-8dde-7eb5125d6f90	https://app.midtrans.com/snap/v4/redirection/a651fb50-e0ea-45d2-8dde-7eb5125d6f90	\N	\N	245439	IDR	pending	\N	{}	{}	\N	\N	2025-09-14 06:19:19.176	2025-09-14 06:19:19.176
719	RYLS776AEM	cccf66e6-72c7-4e31-99e1-64a88a0eb73e	https://app.midtrans.com/snap/v4/redirection/cccf66e6-72c7-4e31-99e1-64a88a0eb73e	\N	\N	245439	IDR	pending	\N	{}	{}	\N	\N	2025-09-14 08:29:13.885	2025-09-14 08:29:13.885
720	RYLS778CBLCS	e18063c6-07f8-4680-a4ac-ea96b96c87e7	https://app.midtrans.com/snap/v4/redirection/e18063c6-07f8-4680-a4ac-ea96b96c87e7	\N	\N	245439	IDR	pending	\N	{}	{}	\N	\N	2025-09-14 12:11:22.905	2025-09-14 12:11:22.905
721	RYLS779PHTNPYC	5b0c88a7-319b-4dae-bdac-7d1c742b289f	https://app.midtrans.com/snap/v4/redirection/5b0c88a7-319b-4dae-bdac-7d1c742b289f	\N	\N	245439	IDR	pending	\N	{}	{}	\N	\N	2025-09-14 12:20:30.017	2025-09-14 12:20:30.017
722	RYLS780GVBN	dca10a11-153c-4df7-a1da-9d48c1467623	https://app.midtrans.com/snap/v4/redirection/dca10a11-153c-4df7-a1da-9d48c1467623	\N	\N	245439	IDR	pending	\N	{}	{}	\N	\N	2025-09-14 12:30:02.784	2025-09-14 12:30:02.784
723	RYLS781SRGYAA	03cccdc7-49a9-453a-812d-211bdd5105ab	https://app.midtrans.com/snap/v4/redirection/03cccdc7-49a9-453a-812d-211bdd5105ab	\N	\N	245439	IDR	pending	\N	{}	{}	\N	\N	2025-09-14 13:44:04.112	2025-09-14 13:44:04.112
724	RYLS782VXTZFR	5035d824-4967-43b9-90e6-76034f8186fb	https://app.midtrans.com/snap/v4/redirection/5035d824-4967-43b9-90e6-76034f8186fb	\N	\N	245439	IDR	pending	\N	{}	{}	\N	\N	2025-09-14 15:33:32.89	2025-09-14 15:33:32.89
725	RYLS783TGWIIHO	fd72b3d0-2ff3-4c83-99a9-1773aaa7a5b0	https://app.midtrans.com/snap/v4/redirection/fd72b3d0-2ff3-4c83-99a9-1773aaa7a5b0	\N	\N	245439	IDR	pending	\N	{}	{}	\N	\N	2025-09-14 16:07:09.335	2025-09-14 16:07:09.335
726	RYLS784LFMLN	4697685f-d975-4310-ac0c-b5383ec4e690	https://app.midtrans.com/snap/v4/redirection/4697685f-d975-4310-ac0c-b5383ec4e690	\N	\N	245439	IDR	pending	\N	{}	{}	\N	\N	2025-09-14 17:35:05.891	2025-09-14 17:35:05.891
727	RYLS785DOGOCM	4ef00685-769e-4f12-bc86-fcc72beb0ef9	https://app.midtrans.com/snap/v4/redirection/4ef00685-769e-4f12-bc86-fcc72beb0ef9	\N	\N	245439	IDR	pending	\N	{}	{}	\N	\N	2025-09-14 22:45:34.799	2025-09-14 22:45:34.799
728	RYLS786JZSVAWS	8fc6b0eb-3d69-4841-a26e-be20548d4963	https://app.midtrans.com/snap/v4/redirection/8fc6b0eb-3d69-4841-a26e-be20548d4963	\N	\N	245640	IDR	pending	\N	{}	{}	\N	\N	2025-09-15 02:32:36.228	2025-09-15 02:32:36.228
729	RYLS787PGLGF	30e4ca27-37ae-4b7e-bc69-8aecf92ecb37	https://app.midtrans.com/snap/v4/redirection/30e4ca27-37ae-4b7e-bc69-8aecf92ecb37	\N	\N	245640	IDR	pending	\N	{}	{}	\N	\N	2025-09-15 06:42:06.869	2025-09-15 06:42:06.869
730	RYLS788UZAKE	14033ef1-ce91-483f-867f-485a62f2aade	https://app.midtrans.com/snap/v4/redirection/14033ef1-ce91-483f-867f-485a62f2aade	\N	\N	245640	IDR	pending	\N	{}	{}	\N	\N	2025-09-15 08:02:01.986	2025-09-15 08:02:01.986
731	RYLS790XOFREU	c856fa55-a95a-4abe-93c9-ca96cbc839c7	https://app.midtrans.com/snap/v4/redirection/c856fa55-a95a-4abe-93c9-ca96cbc839c7	\N	\N	245640	IDR	pending	\N	{}	{}	\N	\N	2025-09-15 12:51:14.163	2025-09-15 12:51:14.163
732	RYLS791GUHTY	ec219d13-7ee6-49f6-b43f-dcc92b00ea56	https://app.midtrans.com/snap/v4/redirection/ec219d13-7ee6-49f6-b43f-dcc92b00ea56	\N	\N	245640	IDR	pending	\N	{}	{}	\N	\N	2025-09-15 13:02:43.758	2025-09-15 13:02:43.758
733	RYLS792OEEC	f2fb6594-3ad5-426d-a2d8-9bd70b580ecc	https://app.midtrans.com/snap/v4/redirection/f2fb6594-3ad5-426d-a2d8-9bd70b580ecc	\N	\N	245640	IDR	pending	\N	{}	{}	\N	\N	2025-09-15 14:14:58.104	2025-09-15 14:14:58.104
734	RYLS793TICHRYP	c3042706-b1b1-406e-9555-2bf618e57aec	https://app.midtrans.com/snap/v4/redirection/c3042706-b1b1-406e-9555-2bf618e57aec	\N	\N	245640	IDR	pending	\N	{}	{}	\N	\N	2025-09-15 15:56:51.13	2025-09-15 15:56:51.13
735	RYLS794DWNF	5cf3cf6d-49e6-4177-82f5-4c4f7597ec1a	https://app.midtrans.com/snap/v4/redirection/5cf3cf6d-49e6-4177-82f5-4c4f7597ec1a	\N	\N	245640	IDR	pending	\N	{}	{}	\N	\N	2025-09-15 17:09:12.173	2025-09-15 17:09:12.173
736	RYLS795MSZXKKC	47bed6c9-2648-4bfb-95ac-845481044871	https://app.midtrans.com/snap/v4/redirection/47bed6c9-2648-4bfb-95ac-845481044871	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 03:39:13.26	2025-09-16 03:39:13.26
737	RYLS796RNMIV	49bfd54b-2dda-48b5-bd83-2be21978aead	https://app.midtrans.com/snap/v4/redirection/49bfd54b-2dda-48b5-bd83-2be21978aead	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 03:39:45.688	2025-09-16 03:39:45.688
738	RYLS797AEYFH	11a2ebba-218c-4259-8c6e-9e5bfc23a48e	https://app.midtrans.com/snap/v4/redirection/11a2ebba-218c-4259-8c6e-9e5bfc23a48e	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 04:16:15.35	2025-09-16 04:16:15.35
739	RYLS799INGDIFK	8d138cb8-0187-4ca7-92aa-b9d0e101ce34	https://app.midtrans.com/snap/v4/redirection/8d138cb8-0187-4ca7-92aa-b9d0e101ce34	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 04:58:50.486	2025-09-16 04:58:50.486
740	RYLS800IVQUB	e0300c87-3590-471f-b309-bf6569c47369	https://app.midtrans.com/snap/v4/redirection/e0300c87-3590-471f-b309-bf6569c47369	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 05:44:17.253	2025-09-16 05:44:17.253
741	RYLS801YBEIAE	b5171a13-a83a-440d-94c9-3cadf18c9612	https://app.midtrans.com/snap/v4/redirection/b5171a13-a83a-440d-94c9-3cadf18c9612	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 05:46:48.136	2025-09-16 05:46:48.136
742	RYLS802PTPEKVS	63e3f0ce-10de-42aa-8dba-902e7a5da53f	https://app.midtrans.com/snap/v4/redirection/63e3f0ce-10de-42aa-8dba-902e7a5da53f	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 06:36:50.78	2025-09-16 06:36:50.78
743	RYLS803OKZMT	29bff6c5-3fd3-4657-91e9-1df7ef387a18	https://app.midtrans.com/snap/v4/redirection/29bff6c5-3fd3-4657-91e9-1df7ef387a18	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 06:58:15.838	2025-09-16 06:58:15.838
744	RYLS804IXNUL	514d7731-be20-49c3-b71d-9b0b87903563	https://app.midtrans.com/snap/v4/redirection/514d7731-be20-49c3-b71d-9b0b87903563	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 07:42:14.156	2025-09-16 07:42:14.156
745	RYLS805VFPZCNQ	d9df3f61-b317-4ce3-9cd7-f74c7ebbd76f	https://app.midtrans.com/snap/v4/redirection/d9df3f61-b317-4ce3-9cd7-f74c7ebbd76f	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 08:17:40.673	2025-09-16 08:17:40.673
746	RYLS806NRCBJEX	bb7ef62b-ba9c-4a99-a748-b13003c3f78b	https://app.midtrans.com/snap/v4/redirection/bb7ef62b-ba9c-4a99-a748-b13003c3f78b	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 08:23:16.155	2025-09-16 08:23:16.155
747	RYLS807MARKARYA	db5c952d-742e-432a-b4de-82f47fabf7a1	https://app.midtrans.com/snap/v4/redirection/db5c952d-742e-432a-b4de-82f47fabf7a1	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 08:43:49.74	2025-09-16 08:43:49.74
748	RYLS808TITWHOH	71a4f874-0b96-4033-8d2e-fcf2d0b70bfb	https://app.midtrans.com/snap/v4/redirection/71a4f874-0b96-4033-8d2e-fcf2d0b70bfb	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 11:05:21.824	2025-09-16 11:05:21.824
749	RYLS809ZXAVR	5f78b197-8885-41f7-9216-5605eadb6b54	https://app.midtrans.com/snap/v4/redirection/5f78b197-8885-41f7-9216-5605eadb6b54	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 13:17:51.324	2025-09-16 13:17:51.324
750	RYLS810NNXB	cf711822-407f-4b27-9404-1328de3c5c9e	https://app.midtrans.com/snap/v4/redirection/cf711822-407f-4b27-9404-1328de3c5c9e	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 13:54:22.12	2025-09-16 13:54:22.12
751	RYLS811OGFVUCJ	2e7faba9-e06b-49d2-8e8b-9b0343358586	https://app.midtrans.com/snap/v4/redirection/2e7faba9-e06b-49d2-8e8b-9b0343358586	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 14:33:09.767	2025-09-16 14:33:09.767
752	RYLS812GWEKM	86ef2ab7-64d6-4ef6-bf6b-ba270a9c07f0	https://app.midtrans.com/snap/v4/redirection/86ef2ab7-64d6-4ef6-bf6b-ba270a9c07f0	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 16:23:55.588	2025-09-16 16:23:55.588
753	RYLS813PCC	9a0c651e-016f-4cca-8f48-c901f5ef17ba	https://app.midtrans.com/snap/v4/redirection/9a0c651e-016f-4cca-8f48-c901f5ef17ba	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 16:26:09.888	2025-09-16 16:26:09.888
754	RYLS814BFOHB	2992f609-6ab8-4cdc-9d48-c9721f83e064	https://app.midtrans.com/snap/v4/redirection/2992f609-6ab8-4cdc-9d48-c9721f83e064	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 17:17:38.673	2025-09-16 17:17:38.673
755	RYLS815VJMUMO	00f9d1a2-c112-49a0-8aeb-3da40cd1c1ca	https://app.midtrans.com/snap/v4/redirection/00f9d1a2-c112-49a0-8aeb-3da40cd1c1ca	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 20:15:57.044	2025-09-16 20:15:57.044
756	RYLS816Y	25890762-9824-4a8b-81a7-92d16cfdd6bc	https://app.midtrans.com/snap/v4/redirection/25890762-9824-4a8b-81a7-92d16cfdd6bc	\N	\N	245608	IDR	pending	\N	{}	{}	\N	\N	2025-09-16 22:35:24.617	2025-09-16 22:35:24.617
757	RYLS817LGYOJ	b1d34d35-d204-483c-b75c-28cea971234e	https://app.midtrans.com/snap/v4/redirection/b1d34d35-d204-483c-b75c-28cea971234e	\N	\N	245592	IDR	pending	\N	{}	{}	\N	\N	2025-09-17 00:47:58.718	2025-09-17 00:47:58.718
758	RYLS818YBKXPG	3bb80ea1-2936-4e4b-b4e1-7b15533c25b6	https://app.midtrans.com/snap/v4/redirection/3bb80ea1-2936-4e4b-b4e1-7b15533c25b6	\N	\N	245592	IDR	pending	\N	{}	{}	\N	\N	2025-09-17 03:03:41.45	2025-09-17 03:03:41.45
759	RYLS819IFIETOB	313467f5-6ced-46a7-96b7-093e649046e5	https://app.midtrans.com/snap/v4/redirection/313467f5-6ced-46a7-96b7-093e649046e5	\N	\N	245592	IDR	pending	\N	{}	{}	\N	\N	2025-09-17 03:25:30.626	2025-09-17 03:25:30.626
760	RYLS820DQNTMG	452ef303-7335-48d2-b891-87609e024d3c	https://app.midtrans.com/snap/v4/redirection/452ef303-7335-48d2-b891-87609e024d3c	\N	\N	245592	IDR	pending	\N	{}	{}	\N	\N	2025-09-17 11:58:00.321	2025-09-17 11:58:00.321
761	RYLS821FACWQP	f9cd01eb-a431-4ba3-9dde-4ea90e3ac876	https://app.midtrans.com/snap/v4/redirection/f9cd01eb-a431-4ba3-9dde-4ea90e3ac876	\N	\N	245592	IDR	pending	\N	{}	{}	\N	\N	2025-09-17 12:33:59.59	2025-09-17 12:33:59.59
762	RYLS822OEQGKA	0fd2403a-c311-4ba4-b28c-e88c8abc5b6d	https://app.midtrans.com/snap/v4/redirection/0fd2403a-c311-4ba4-b28c-e88c8abc5b6d	\N	\N	245592	IDR	pending	\N	{}	{}	\N	\N	2025-09-17 12:39:26.126	2025-09-17 12:39:26.126
763	RYLS823FRBF	cc01464f-2b34-4c78-8bc4-1a907033fad6	https://app.midtrans.com/snap/v4/redirection/cc01464f-2b34-4c78-8bc4-1a907033fad6	\N	\N	245592	IDR	pending	\N	{}	{}	\N	\N	2025-09-17 12:58:11.625	2025-09-17 12:58:11.625
764	RYLS824IDQKD	4eb8617d-f5f2-4421-b3e8-ec63c5df5822	https://app.midtrans.com/snap/v4/redirection/4eb8617d-f5f2-4421-b3e8-ec63c5df5822	\N	\N	245592	IDR	pending	\N	{}	{}	\N	\N	2025-09-17 13:26:49.598	2025-09-17 13:26:49.598
765	RYLS825WPQPAX	279e0750-fb87-4818-a52c-38545df69ab9	https://app.midtrans.com/snap/v4/redirection/279e0750-fb87-4818-a52c-38545df69ab9	\N	\N	245592	IDR	pending	\N	{}	{}	\N	\N	2025-09-17 14:33:58.565	2025-09-17 14:33:58.565
766	RYLS826DOBHBW	4164a19f-f892-4fc9-8f49-c43640d5ed3a	https://app.midtrans.com/snap/v4/redirection/4164a19f-f892-4fc9-8f49-c43640d5ed3a	\N	\N	245592	IDR	pending	\N	{}	{}	\N	\N	2025-09-17 18:06:36.263	2025-09-17 18:06:36.263
767	RYLS827FCPXL	4e38933a-f302-473a-903d-60c29d0b136a	https://app.midtrans.com/snap/v4/redirection/4e38933a-f302-473a-903d-60c29d0b136a	\N	\N	245592	IDR	pending	\N	{}	{}	\N	\N	2025-09-17 18:27:32.098	2025-09-17 18:27:32.098
768	RYLS828HJHBIJ	f4270952-6126-44d3-8aa8-d1597af846df	https://app.midtrans.com/snap/v4/redirection/f4270952-6126-44d3-8aa8-d1597af846df	\N	\N	245592	IDR	pending	\N	{}	{}	\N	\N	2025-09-17 18:28:55.129	2025-09-17 18:28:55.129
769	RYLS829FGLXA	401ab143-df39-4a7d-ab48-add38633ef44	https://app.midtrans.com/snap/v4/redirection/401ab143-df39-4a7d-ab48-add38633ef44	\N	\N	245592	IDR	pending	\N	{}	{}	\N	\N	2025-09-17 22:31:48.573	2025-09-17 22:31:48.573
770	RYLS830CBQIVR	76315a7e-a832-4aa3-aec9-7375a17d8ac5	https://app.midtrans.com/snap/v4/redirection/76315a7e-a832-4aa3-aec9-7375a17d8ac5	\N	\N	245592	IDR	pending	\N	{}	{}	\N	\N	2025-09-17 23:02:41.567	2025-09-17 23:02:41.567
771	RYLS831EWIFHZM	bd586e3f-b425-4961-864d-79dee500fc5b	https://app.midtrans.com/snap/v4/redirection/bd586e3f-b425-4961-864d-79dee500fc5b	\N	\N	245592	IDR	pending	\N	{}	{}	\N	\N	2025-09-17 23:04:30.935	2025-09-17 23:04:30.935
772	RYLS832OVOSLBLZ	feabcd20-924c-4a0b-8292-1f146f0d5bfc	https://app.midtrans.com/snap/v4/redirection/feabcd20-924c-4a0b-8292-1f146f0d5bfc	\N	\N	246144	IDR	pending	\N	{}	{}	\N	\N	2025-09-18 05:29:38.74	2025-09-18 05:29:38.74
773	RYLS833QULZZVMP	a2a2a7e3-99dd-475f-93b3-30b310027e0d	https://app.midtrans.com/snap/v4/redirection/a2a2a7e3-99dd-475f-93b3-30b310027e0d	\N	\N	246144	IDR	pending	\N	{}	{}	\N	\N	2025-09-18 13:46:55.837	2025-09-18 13:46:55.837
774	RYLS834NNMP	796952f0-f264-4445-af76-46962fd0a013	https://app.midtrans.com/snap/v4/redirection/796952f0-f264-4445-af76-46962fd0a013	\N	\N	246144	IDR	pending	\N	{}	{}	\N	\N	2025-09-18 22:37:24.869	2025-09-18 22:37:24.869
775	RYLS835TVOYR	a88a4292-3896-4db7-9bc5-0a6e8eb4845c	https://app.midtrans.com/snap/v4/redirection/a88a4292-3896-4db7-9bc5-0a6e8eb4845c	\N	\N	247077	IDR	pending	\N	{}	{}	\N	\N	2025-09-19 04:32:28.68	2025-09-19 04:32:28.68
776	RYLS836LPBTTI	50f208a3-e1be-4341-8f91-308487c69171	https://app.midtrans.com/snap/v4/redirection/50f208a3-e1be-4341-8f91-308487c69171	\N	\N	247077	IDR	pending	\N	{}	{}	\N	\N	2025-09-19 07:11:00.27	2025-09-19 07:11:00.27
777	RYLS837PSQNSF	458c4ba0-7b45-4857-93c9-89662b582e65	https://app.midtrans.com/snap/v4/redirection/458c4ba0-7b45-4857-93c9-89662b582e65	\N	\N	247077	IDR	pending	\N	{}	{}	\N	\N	2025-09-19 08:17:26.634	2025-09-19 08:17:26.634
778	RYLS838CEYAE	cf64338a-4d16-4023-b8e8-f951db6ed19c	https://app.midtrans.com/snap/v4/redirection/cf64338a-4d16-4023-b8e8-f951db6ed19c	\N	\N	247077	IDR	pending	\N	{}	{}	\N	\N	2025-09-19 08:26:09.611	2025-09-19 08:26:09.611
779	RYLS839RSZIXOKB	5a002367-fc98-4c9c-b5b0-eb1d979b3bd1	https://app.midtrans.com/snap/v4/redirection/5a002367-fc98-4c9c-b5b0-eb1d979b3bd1	\N	\N	247077	IDR	pending	\N	{}	{}	\N	\N	2025-09-19 08:38:52.172	2025-09-19 08:38:52.172
780	RYLS840BSZVT	8c9f1b63-f587-42b8-858e-2ebb5af0a737	https://app.midtrans.com/snap/v4/redirection/8c9f1b63-f587-42b8-858e-2ebb5af0a737	\N	\N	247077	IDR	pending	\N	{}	{}	\N	\N	2025-09-19 08:59:10.092	2025-09-19 08:59:10.092
781	RYLS841ZSBMRASP	76adcb18-3582-4b43-9f36-8071b91e18b6	https://app.midtrans.com/snap/v4/redirection/76adcb18-3582-4b43-9f36-8071b91e18b6	\N	\N	247077	IDR	pending	\N	{}	{}	\N	\N	2025-09-19 15:21:19.477	2025-09-19 15:21:19.477
782	RYLS846KOWFVB	14424dc3-3a39-4acb-b5a2-dd00e3895903	https://app.midtrans.com/snap/v4/redirection/14424dc3-3a39-4acb-b5a2-dd00e3895903	\N	\N	247077	IDR	pending	\N	{}	{}	\N	\N	2025-09-19 21:02:20.34	2025-09-19 21:02:20.34
783	RYLS847SDUVLZ	3149be63-50bb-4824-ae48-252efde3f150	https://app.midtrans.com/snap/v4/redirection/3149be63-50bb-4824-ae48-252efde3f150	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-20 00:39:39.556	2025-09-20 00:39:39.556
784	RYLS848JZXIY	50962540-c4fb-4c67-9a6f-4aad08fd0fd9	https://app.midtrans.com/snap/v4/redirection/50962540-c4fb-4c67-9a6f-4aad08fd0fd9	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-20 02:02:13.331	2025-09-20 02:02:13.331
785	RYLS849VPBL	a3d80306-b50e-412d-864e-e3209cc10418	https://app.midtrans.com/snap/v4/redirection/a3d80306-b50e-412d-864e-e3209cc10418	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-20 05:05:56.266	2025-09-20 05:05:56.266
786	RYLS850KWIG	bd2585ab-a207-4c10-861e-9627d04b2351	https://app.midtrans.com/snap/v4/redirection/bd2585ab-a207-4c10-861e-9627d04b2351	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-20 05:49:41.619	2025-09-20 05:49:41.619
787	RYLS851CAH	e94418ea-d1e3-4e1f-ad57-8cc8caf78ccc	https://app.midtrans.com/snap/v4/redirection/e94418ea-d1e3-4e1f-ad57-8cc8caf78ccc	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-20 07:04:14.604	2025-09-20 07:04:14.604
788	RYLS852WUDNKUO	12be842f-6610-4d06-8b13-99f4c55a6293	https://app.midtrans.com/snap/v4/redirection/12be842f-6610-4d06-8b13-99f4c55a6293	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-20 07:23:05.932	2025-09-20 07:23:05.932
789	RYLS853KOKR	568f6f8f-6aa1-4e2b-b5e4-fd89ad16a360	https://app.midtrans.com/snap/v4/redirection/568f6f8f-6aa1-4e2b-b5e4-fd89ad16a360	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-20 09:07:58.144	2025-09-20 09:07:58.144
790	RYLS854HYON	c9feb466-3687-49b5-9623-d448ecff7b7b	https://app.midtrans.com/snap/v4/redirection/c9feb466-3687-49b5-9623-d448ecff7b7b	\N	\N	12414549	IDR	pending	\N	{}	{}	\N	\N	2025-09-20 09:10:05.829	2025-09-20 09:10:05.829
791	RYLS855XEFV	cbd4e407-c5d3-4b09-9ffd-16e23e7923b4	https://app.midtrans.com/snap/v4/redirection/cbd4e407-c5d3-4b09-9ffd-16e23e7923b4	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-20 09:14:02.415	2025-09-20 09:14:02.415
792	RYLS856JNIH	49118d8e-eae5-4960-9ba2-3fd5922cb047	https://app.midtrans.com/snap/v4/redirection/49118d8e-eae5-4960-9ba2-3fd5922cb047	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-20 11:40:24.611	2025-09-20 11:40:24.611
793	RYLS857UWWEKX	f0e1e228-9f71-4492-9a63-e5f85036ac19	https://app.midtrans.com/snap/v4/redirection/f0e1e228-9f71-4492-9a63-e5f85036ac19	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-20 12:56:18.082	2025-09-20 12:56:18.082
794	RYLS858NUHYXK	1469b700-5fb9-4d68-849e-6dde6a0c5847	https://app.midtrans.com/snap/v4/redirection/1469b700-5fb9-4d68-849e-6dde6a0c5847	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-20 14:50:49.129	2025-09-20 14:50:49.129
795	RYLS859FVKDXXNM	5c30581b-c2e9-49ce-84ac-8ed7c12d74c4	https://app.midtrans.com/snap/v4/redirection/5c30581b-c2e9-49ce-84ac-8ed7c12d74c4	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-20 14:57:51.23	2025-09-20 14:57:51.23
796	RYLS860SVOGAICX	03dbce93-a569-4315-8257-f5087169ce7b	https://app.midtrans.com/snap/v4/redirection/03dbce93-a569-4315-8257-f5087169ce7b	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-20 14:59:06.36	2025-09-20 14:59:06.36
797	RYLS861RGXAS	0a2ded67-215b-4b3a-8983-4a592a934c70	https://app.midtrans.com/snap/v4/redirection/0a2ded67-215b-4b3a-8983-4a592a934c70	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-20 16:16:50.742	2025-09-20 16:16:50.742
798	RYLS863IIOQMU	1ccf9026-aad2-4540-9c4d-7ea393e83b35	https://app.midtrans.com/snap/v4/redirection/1ccf9026-aad2-4540-9c4d-7ea393e83b35	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-21 00:54:35.993	2025-09-21 00:54:35.993
799	RYLS864WKNLT	5c7fc9ab-493f-417d-aea7-eb39fd2b13d7	https://app.midtrans.com/snap/v4/redirection/5c7fc9ab-493f-417d-aea7-eb39fd2b13d7	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-21 02:28:41.361	2025-09-21 02:28:41.361
800	RYLS865HNNCTBTA	12ed2ec0-fd6d-44bb-a531-1d4d34a9dddc	https://app.midtrans.com/snap/v4/redirection/12ed2ec0-fd6d-44bb-a531-1d4d34a9dddc	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-21 02:34:31.072	2025-09-21 02:34:31.072
801	RYLS866VOUXS	0a363924-2268-4f36-81cb-09ce65bca8e9	https://app.midtrans.com/snap/v4/redirection/0a363924-2268-4f36-81cb-09ce65bca8e9	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-21 02:35:47.548	2025-09-21 02:35:47.548
802	RYLS867WWKSYWM	1533ba0f-f3bb-4f01-9ee5-d441636707dd	https://app.midtrans.com/snap/v4/redirection/1533ba0f-f3bb-4f01-9ee5-d441636707dd	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-21 08:28:06.799	2025-09-21 08:28:06.799
803	RYLS868CWKMDYD	35c0e442-ff06-4790-b3c0-39da241730e6	https://app.midtrans.com/snap/v4/redirection/35c0e442-ff06-4790-b3c0-39da241730e6	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-21 08:33:18.556	2025-09-21 08:33:18.556
804	RYLS869TOTDU	57d747a9-2d87-4bf0-a530-56dc0f6bce88	https://app.midtrans.com/snap/v4/redirection/57d747a9-2d87-4bf0-a530-56dc0f6bce88	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-21 09:28:54.794	2025-09-21 09:28:54.794
805	RYLS870PZOLL	a008d8f9-9cfc-4b93-ac4a-e86cbdf237af	https://app.midtrans.com/snap/v4/redirection/a008d8f9-9cfc-4b93-ac4a-e86cbdf237af	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-21 10:45:16.322	2025-09-21 10:45:16.322
806	RYLS871JZESF	97bf0886-c3bb-4934-adc2-ecb9d7efd884	https://app.midtrans.com/snap/v4/redirection/97bf0886-c3bb-4934-adc2-ecb9d7efd884	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-21 14:24:04.357	2025-09-21 14:24:04.357
807	RYLS872PSYJKXL	2a506b96-8716-42d7-a434-53a1bbd2e5a9	https://app.midtrans.com/snap/v4/redirection/2a506b96-8716-42d7-a434-53a1bbd2e5a9	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-21 15:53:03.073	2025-09-21 15:53:03.073
808	RYLS873GAJLUA	b5dab1ff-c4fc-4bf3-88e2-41e25bb32867	https://app.midtrans.com/snap/v4/redirection/b5dab1ff-c4fc-4bf3-88e2-41e25bb32867	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-21 16:38:53.18	2025-09-21 16:38:53.18
809	RYLS876DUKII	92c13769-6090-4475-ac29-3f7fbeaa2f50	https://app.midtrans.com/snap/v4/redirection/92c13769-6090-4475-ac29-3f7fbeaa2f50	\N	\N	248291	IDR	pending	\N	{}	{}	\N	\N	2025-09-21 19:48:19.528	2025-09-21 19:48:19.528
810	RYLS877LFHDM	b7dc5452-ea29-4904-b24a-97024505139b	https://app.midtrans.com/snap/v4/redirection/b7dc5452-ea29-4904-b24a-97024505139b	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 02:08:30.421	2025-09-22 02:08:30.421
811	RYLS878HSUEZRW	d20313e5-077f-462d-b01e-1c6b4adf41d8	https://app.midtrans.com/snap/v4/redirection/d20313e5-077f-462d-b01e-1c6b4adf41d8	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 04:29:45.412	2025-09-22 04:29:45.412
812	RYLS879WPTPO	ae432662-bab4-4e6a-91c9-152f885e7ba7	https://app.midtrans.com/snap/v4/redirection/ae432662-bab4-4e6a-91c9-152f885e7ba7	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 04:45:42.357	2025-09-22 04:45:42.357
813	RYLS880NIMGKVQ	2e2c87b8-905e-478f-9996-b2ef07801187	https://app.midtrans.com/snap/v4/redirection/2e2c87b8-905e-478f-9996-b2ef07801187	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 05:26:31.036	2025-09-22 05:26:31.036
814	RYLS881AJJIGWV	39aa4aea-9f7c-4e94-84b1-952761b76035	https://app.midtrans.com/snap/v4/redirection/39aa4aea-9f7c-4e94-84b1-952761b76035	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 06:02:31.432	2025-09-22 06:02:31.432
815	RYLS882YHXE	31bfbf8c-3792-4a8f-9097-43d797bc3fc3	https://app.midtrans.com/snap/v4/redirection/31bfbf8c-3792-4a8f-9097-43d797bc3fc3	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 06:55:18.272	2025-09-22 06:55:18.272
816	RYLS883RRJRPZZ	e1b3fe9f-734c-4210-9586-46f841929c77	https://app.midtrans.com/snap/v4/redirection/e1b3fe9f-734c-4210-9586-46f841929c77	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 07:44:17.868	2025-09-22 07:44:17.868
817	RYLS884YSHTCP	96d06bb7-8d02-4bb6-90f9-9531ea14c565	https://app.midtrans.com/snap/v4/redirection/96d06bb7-8d02-4bb6-90f9-9531ea14c565	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 07:51:45.573	2025-09-22 07:51:45.573
818	RYLS885SQCUZGT	23c76644-197b-48e4-ad61-4cc8bc340b96	https://app.midtrans.com/snap/v4/redirection/23c76644-197b-48e4-ad61-4cc8bc340b96	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 08:12:08.674	2025-09-22 08:12:08.674
819	RYLS887XIOJD	b0c75289-86ee-41c8-873a-4128e67fdeab	https://app.midtrans.com/snap/v4/redirection/b0c75289-86ee-41c8-873a-4128e67fdeab	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 08:37:47.452	2025-09-22 08:37:47.452
820	RYLS888MLVXUGQ	c773a73f-7f6b-48d2-be2f-5ddbb73eb585	https://app.midtrans.com/snap/v4/redirection/c773a73f-7f6b-48d2-be2f-5ddbb73eb585	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 09:49:44.409	2025-09-22 09:49:44.409
821	RYLS889AMTAG	28ef5be9-dece-4cc8-be7e-213d2aff593b	https://app.midtrans.com/snap/v4/redirection/28ef5be9-dece-4cc8-be7e-213d2aff593b	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 12:24:14.904	2025-09-22 12:24:14.904
822	RYLS890PVYQBTS	28310440-24b2-4687-b042-9377e8e39250	https://app.midtrans.com/snap/v4/redirection/28310440-24b2-4687-b042-9377e8e39250	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 12:43:47.467	2025-09-22 12:43:47.467
823	RYLS891GUAARVX	15e0e18f-3f0b-412f-9a01-0ce178f9d5e6	https://app.midtrans.com/snap/v4/redirection/15e0e18f-3f0b-412f-9a01-0ce178f9d5e6	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 12:54:52.829	2025-09-22 12:54:52.829
824	RYLS892FPHZ	8f8f54c9-a538-412b-87af-7152a89be862	https://app.midtrans.com/snap/v4/redirection/8f8f54c9-a538-412b-87af-7152a89be862	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 20:06:35.73	2025-09-22 20:06:35.73
825	RYLS893LJSQ	875690df-bf90-48f9-9c14-8e10711ee31d	https://app.midtrans.com/snap/v4/redirection/875690df-bf90-48f9-9c14-8e10711ee31d	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 20:12:37.881	2025-09-22 20:12:37.881
826	RYLS894CV	265ab365-f244-4304-be61-418ecfce87d8	https://app.midtrans.com/snap/v4/redirection/265ab365-f244-4304-be61-418ecfce87d8	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 21:00:24.113	2025-09-22 21:00:24.113
827	RYLS895CRPNRL	1e4a4d51-152f-4907-8a83-a78189fd2146	https://app.midtrans.com/snap/v4/redirection/1e4a4d51-152f-4907-8a83-a78189fd2146	\N	\N	248468	IDR	pending	\N	{}	{}	\N	\N	2025-09-22 21:02:12.39	2025-09-22 21:02:12.39
828	RYLS896UBLEB	d3a6c58f-0885-4c8d-a852-805de59be967	https://app.midtrans.com/snap/v4/redirection/d3a6c58f-0885-4c8d-a852-805de59be967	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 00:28:50.206	2025-09-23 00:28:50.206
829	RYLS897ZGZQCLR	5aa5d797-3b87-4e14-880a-649157b852d1	https://app.midtrans.com/snap/v4/redirection/5aa5d797-3b87-4e14-880a-649157b852d1	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 00:44:22.824	2025-09-23 00:44:22.824
830	RYLS898JQNMEOX	48ca6600-f4d7-43d9-b07a-67104fb0f1e0	https://app.midtrans.com/snap/v4/redirection/48ca6600-f4d7-43d9-b07a-67104fb0f1e0	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 02:06:07.157	2025-09-23 02:06:07.157
831	RYLS906CRPIUSF	60e9eedf-9556-4c3a-bf06-fadf9a3f79d3	https://app.midtrans.com/snap/v4/redirection/60e9eedf-9556-4c3a-bf06-fadf9a3f79d3	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 07:42:53.078	2025-09-23 07:42:53.078
832	RYLS907THTEVX	288349c2-9ad5-44cf-b3e8-d1b975032ff4	https://app.midtrans.com/snap/v4/redirection/288349c2-9ad5-44cf-b3e8-d1b975032ff4	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 07:44:46.52	2025-09-23 07:44:46.52
833	RYLS908IBUFWZL	f32130cf-1138-4a99-8f42-bb341ecc04d3	https://app.midtrans.com/snap/v4/redirection/f32130cf-1138-4a99-8f42-bb341ecc04d3	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 07:51:12.103	2025-09-23 07:51:12.103
834	RYLS909BYIGFE	261eeda3-e12c-42cb-9a68-edb9b60d0a22	https://app.midtrans.com/snap/v4/redirection/261eeda3-e12c-42cb-9a68-edb9b60d0a22	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 08:13:56.846	2025-09-23 08:13:56.846
835	RYLS910UEGIL	f5df17ac-2a4a-4dc4-b515-c78cdb8d495f	https://app.midtrans.com/snap/v4/redirection/f5df17ac-2a4a-4dc4-b515-c78cdb8d495f	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 08:15:30.446	2025-09-23 08:15:30.446
836	RYLS911GVN	fd41c77f-d208-498b-b41f-b8da71ab56e4	https://app.midtrans.com/snap/v4/redirection/fd41c77f-d208-498b-b41f-b8da71ab56e4	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 08:25:01.055	2025-09-23 08:25:01.055
837	RYLS912HALFPZY	afe6c5ff-d3b2-4f03-b586-babe22eda260	https://app.midtrans.com/snap/v4/redirection/afe6c5ff-d3b2-4f03-b586-babe22eda260	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 08:25:21.47	2025-09-23 08:25:21.47
838	RYLS913CYPDS	b976cbd9-eb9f-4874-893a-b96a1e07fe6a	https://app.midtrans.com/snap/v4/redirection/b976cbd9-eb9f-4874-893a-b96a1e07fe6a	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 08:32:01.03	2025-09-23 08:32:01.03
839	RYLS914COFYR	2608ab33-283d-4012-b370-12e0861fa526	https://app.midtrans.com/snap/v4/redirection/2608ab33-283d-4012-b370-12e0861fa526	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 09:18:37.363	2025-09-23 09:18:37.363
840	RYLS918KSOIZNA	5301407c-4e67-4d71-bfff-d8d49b63df07	https://app.midtrans.com/snap/v4/redirection/5301407c-4e67-4d71-bfff-d8d49b63df07	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 12:02:54.794	2025-09-23 12:02:54.794
841	RYLS919ELBX	b24ba521-be42-4667-9a13-713ed476e001	https://app.midtrans.com/snap/v4/redirection/b24ba521-be42-4667-9a13-713ed476e001	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 12:07:08.732	2025-09-23 12:07:08.732
842	RYLS921IKRDTMF	fd746caf-27c0-4bc0-81ec-51d4e9326d52	https://app.midtrans.com/snap/v4/redirection/fd746caf-27c0-4bc0-81ec-51d4e9326d52	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 12:20:43.916	2025-09-23 12:20:43.916
843	RYLS924BJPCJ	3b4fc14f-88ef-4f27-8523-793a5d5493ba	https://app.midtrans.com/snap/v4/redirection/3b4fc14f-88ef-4f27-8523-793a5d5493ba	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 16:11:00.49	2025-09-23 16:11:00.49
844	RYLS925NNYHTJ	15757b83-340c-4424-8568-25855bc10da4	https://app.midtrans.com/snap/v4/redirection/15757b83-340c-4424-8568-25855bc10da4	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 16:12:03.663	2025-09-23 16:12:03.663
845	RYLS926MGFYQ	b40b9529-c339-4b5e-baa4-bd339d9ff559	https://app.midtrans.com/snap/v4/redirection/b40b9529-c339-4b5e-baa4-bd339d9ff559	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 16:31:00.35	2025-09-23 16:31:00.35
846	RYLS927YTOUVCLW	aa584ada-002d-4e3c-88e6-316be2693218	https://app.midtrans.com/snap/v4/redirection/aa584ada-002d-4e3c-88e6-316be2693218	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 17:13:32.346	2025-09-23 17:13:32.346
847	RYLS928CMMV	1db32403-b4f2-40a0-994d-6e104073a86e	https://app.midtrans.com/snap/v4/redirection/1db32403-b4f2-40a0-994d-6e104073a86e	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 18:19:18.838	2025-09-23 18:19:18.838
848	RYLS929SFCLOFAB	14be0873-25c8-401f-99b2-c75b7d7da508	https://app.midtrans.com/snap/v4/redirection/14be0873-25c8-401f-99b2-c75b7d7da508	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 18:21:32.93	2025-09-23 18:21:32.93
849	RYLS930ZKBNW	7f6cf113-eef0-4e6b-b9b0-62b2ce980dd6	https://app.midtrans.com/snap/v4/redirection/7f6cf113-eef0-4e6b-b9b0-62b2ce980dd6	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 20:12:39.117	2025-09-23 20:12:39.117
850	RYLS931IVYUY	930c5338-1c62-4a6a-a878-e9dbcfad9d78	https://app.midtrans.com/snap/v4/redirection/930c5338-1c62-4a6a-a878-e9dbcfad9d78	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 20:25:11.106	2025-09-23 20:25:11.106
851	RYLS932XVFJDP	0de6e2d3-0736-452e-a20c-2418e210a073	https://app.midtrans.com/snap/v4/redirection/0de6e2d3-0736-452e-a20c-2418e210a073	\N	\N	248703	IDR	pending	\N	{}	{}	\N	\N	2025-09-23 22:42:58.84	2025-09-23 22:42:58.84
852	RYLS934QQXOKDNX	387b38fd-f738-444b-b567-b946d881fa77	https://app.midtrans.com/snap/v4/redirection/387b38fd-f738-444b-b567-b946d881fa77	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 00:50:03.411	2025-09-24 00:50:03.411
853	RYLS936EIITG	e4947301-3db2-4c48-8a2e-d1274d34016b	https://app.midtrans.com/snap/v4/redirection/e4947301-3db2-4c48-8a2e-d1274d34016b	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 01:11:10.821	2025-09-24 01:11:10.821
854	RYLS937BNFROSR	047cc165-06e6-46c8-9d5b-e87379891afe	https://app.midtrans.com/snap/v4/redirection/047cc165-06e6-46c8-9d5b-e87379891afe	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 02:11:28.232	2025-09-24 02:11:28.232
855	RYLS938KID	f524c95e-fda3-4356-a075-d3efeb411096	https://app.midtrans.com/snap/v4/redirection/f524c95e-fda3-4356-a075-d3efeb411096	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 04:03:23.007	2025-09-24 04:03:23.007
856	RYLS939KNYHONJ	e1ec6b18-7821-4543-b991-31dc992f76ee	https://app.midtrans.com/snap/v4/redirection/e1ec6b18-7821-4543-b991-31dc992f76ee	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 04:20:06.954	2025-09-24 04:20:06.954
857	RYLS940YQCNG	07839a40-71a0-429d-8788-d7051381be73	https://app.midtrans.com/snap/v4/redirection/07839a40-71a0-429d-8788-d7051381be73	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 04:52:16.696	2025-09-24 04:52:16.696
858	RYLS941JHGXNZ	ffd1fb3f-9671-4d1b-bb1a-886217acd52f	https://app.midtrans.com/snap/v4/redirection/ffd1fb3f-9671-4d1b-bb1a-886217acd52f	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 04:53:36.038	2025-09-24 04:53:36.038
859	RYLS942TPRFZZ	55de4a9d-3574-4c07-8104-6f39c3054359	https://app.midtrans.com/snap/v4/redirection/55de4a9d-3574-4c07-8104-6f39c3054359	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 04:54:37.221	2025-09-24 04:54:37.221
860	RYLS943MVRJWCQ	f5c87817-a1f3-4cc7-ab09-0aa7a2b4247d	https://app.midtrans.com/snap/v4/redirection/f5c87817-a1f3-4cc7-ab09-0aa7a2b4247d	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 04:55:17.862	2025-09-24 04:55:17.862
861	RYLS944TUCPU	8a52f7d2-c458-4793-8efc-fc6b71c9b481	https://app.midtrans.com/snap/v4/redirection/8a52f7d2-c458-4793-8efc-fc6b71c9b481	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 04:56:30.98	2025-09-24 04:56:30.98
862	RYLS945EGJK	90793f97-7f1c-4c0f-98eb-920afc3f6b01	https://app.midtrans.com/snap/v4/redirection/90793f97-7f1c-4c0f-98eb-920afc3f6b01	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 04:57:16.768	2025-09-24 04:57:16.768
863	RYLS946URETVU	57dc4727-906c-4186-9727-af6da1283c6c	https://app.midtrans.com/snap/v4/redirection/57dc4727-906c-4186-9727-af6da1283c6c	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 05:07:15.563	2025-09-24 05:07:15.563
864	RYLS947GQPVGYI	856b00a5-0e54-4b37-ac4f-c4c73136cb02	https://app.midtrans.com/snap/v4/redirection/856b00a5-0e54-4b37-ac4f-c4c73136cb02	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 05:10:29.809	2025-09-24 05:10:29.809
865	RYLS948FFSKXF	e464b359-131b-4666-b8a7-f539eddd3c03	https://app.midtrans.com/snap/v4/redirection/e464b359-131b-4666-b8a7-f539eddd3c03	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 05:12:30.24	2025-09-24 05:12:30.24
866	RYLS949CS	505fcfd7-1366-40a6-89dc-d408d3a84e16	https://app.midtrans.com/snap/v4/redirection/505fcfd7-1366-40a6-89dc-d408d3a84e16	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 05:12:55.297	2025-09-24 05:12:55.297
867	RYLS950ELKIXCBC	d6c92ea1-78d5-4efe-a33e-3c3f705a5638	https://app.midtrans.com/snap/v4/redirection/d6c92ea1-78d5-4efe-a33e-3c3f705a5638	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 05:21:57.607	2025-09-24 05:21:57.607
868	RYLS951NBZCKXI	97c3ad18-7929-4128-92e0-62cf1ab24b43	https://app.midtrans.com/snap/v4/redirection/97c3ad18-7929-4128-92e0-62cf1ab24b43	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 05:30:05.914	2025-09-24 05:30:05.914
869	RYLS952MMDURXI	a25b9e90-57b6-49dd-86c3-5181130f9b57	https://app.midtrans.com/snap/v4/redirection/a25b9e90-57b6-49dd-86c3-5181130f9b57	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 05:32:29.297	2025-09-24 05:32:29.297
870	RYLS953EHGCTXL	b4f0525f-6d99-44ac-9a8d-2a4451ea7976	https://app.midtrans.com/snap/v4/redirection/b4f0525f-6d99-44ac-9a8d-2a4451ea7976	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 05:49:38.78	2025-09-24 05:49:38.78
871	RYLS954KYQON	e91f2d78-eca7-47ed-a9d3-771c1edc33ba	https://app.midtrans.com/snap/v4/redirection/e91f2d78-eca7-47ed-a9d3-771c1edc33ba	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 05:57:56.855	2025-09-24 05:57:56.855
872	RYLS955KRNTO	9bba5483-2bf1-466f-ba1c-05ca9de3119b	https://app.midtrans.com/snap/v4/redirection/9bba5483-2bf1-466f-ba1c-05ca9de3119b	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 06:06:07.793	2025-09-24 06:06:07.793
873	RYLS956FFBSYLC	16a72924-3cad-4908-ae11-6c5dd34e679a	https://app.midtrans.com/snap/v4/redirection/16a72924-3cad-4908-ae11-6c5dd34e679a	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 06:10:52.527	2025-09-24 06:10:52.527
874	RYLS957ZHDQTJ	da895f56-cdbe-4216-9e9b-23b249d0d16b	https://app.midtrans.com/snap/v4/redirection/da895f56-cdbe-4216-9e9b-23b249d0d16b	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 06:14:43.607	2025-09-24 06:14:43.607
875	RYLS958HAFNVT	805155ae-6dea-401a-8112-968118d299ac	https://app.midtrans.com/snap/v4/redirection/805155ae-6dea-401a-8112-968118d299ac	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 06:33:15.545	2025-09-24 06:33:15.545
876	RYLS959OZDYVJJ	4dbbe43e-781a-4055-b545-89d0f8aac689	https://app.midtrans.com/snap/v4/redirection/4dbbe43e-781a-4055-b545-89d0f8aac689	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 06:46:09.209	2025-09-24 06:46:09.209
877	RYLS960KDNFA	d1932bca-7ced-4935-b541-11d212cff39f	https://app.midtrans.com/snap/v4/redirection/d1932bca-7ced-4935-b541-11d212cff39f	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 07:14:55.209	2025-09-24 07:14:55.209
878	RYLS961LZJT	d28203d0-1349-4dfa-be5e-72aaa5ac7922	https://app.midtrans.com/snap/v4/redirection/d28203d0-1349-4dfa-be5e-72aaa5ac7922	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 07:23:13.365	2025-09-24 07:23:13.365
879	RYLS962QAFOX	bb0585ae-52ec-4e96-a20a-dbc74312cbef	https://app.midtrans.com/snap/v4/redirection/bb0585ae-52ec-4e96-a20a-dbc74312cbef	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 07:29:43.789	2025-09-24 07:29:43.789
880	RYLS963ALHCLJSY	b2e79f45-1cbb-4ce0-9b33-8b404eb354b5	https://app.midtrans.com/snap/v4/redirection/b2e79f45-1cbb-4ce0-9b33-8b404eb354b5	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 07:30:57.726	2025-09-24 07:30:57.726
881	RYLS964LZJVL	47fde640-d470-4931-8de5-680c81174a4d	https://app.midtrans.com/snap/v4/redirection/47fde640-d470-4931-8de5-680c81174a4d	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 07:31:15.921	2025-09-24 07:31:15.921
882	RYLS965TBOGLD	9d2f5a2c-62af-4701-9546-5f38f83fa38f	https://app.midtrans.com/snap/v4/redirection/9d2f5a2c-62af-4701-9546-5f38f83fa38f	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 08:04:41.906	2025-09-24 08:04:41.906
883	RYLS966BQNACX	5a9cb2c5-b940-4615-a7c9-1cdf36900943	https://app.midtrans.com/snap/v4/redirection/5a9cb2c5-b940-4615-a7c9-1cdf36900943	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 08:19:19.318	2025-09-24 08:19:19.318
884	RYLS967ABTDEPC	1ac84b0d-9977-44de-a91d-8e75f0a7986a	https://app.midtrans.com/snap/v4/redirection/1ac84b0d-9977-44de-a91d-8e75f0a7986a	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 08:23:49.907	2025-09-24 08:23:49.907
885	RYLS968DHCXXCNJ	d499a00f-b661-45e8-ad93-0a5b950761f2	https://app.midtrans.com/snap/v4/redirection/d499a00f-b661-45e8-ad93-0a5b950761f2	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 08:42:19.592	2025-09-24 08:42:19.592
886	RYLS969ITZUI	cb293dad-1e0f-4e32-93b1-ba4b9ed18bcb	https://app.midtrans.com/snap/v4/redirection/cb293dad-1e0f-4e32-93b1-ba4b9ed18bcb	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 08:50:40.517	2025-09-24 08:50:40.517
887	RYLS970ZCYFV	c8014a53-f8d8-4f26-9f51-afe884b8acb1	https://app.midtrans.com/snap/v4/redirection/c8014a53-f8d8-4f26-9f51-afe884b8acb1	\N	\N	12464060	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 08:56:59.849	2025-09-24 08:56:59.849
888	RYLS971VTTAM	6236c28f-2c51-4349-8204-990131a6e712	https://app.midtrans.com/snap/v4/redirection/6236c28f-2c51-4349-8204-990131a6e712	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 09:00:43.315	2025-09-24 09:00:43.315
889	RYLS972SHZIVG	f848078d-4f17-4e38-afed-7e3a85c7c7ec	https://app.midtrans.com/snap/v4/redirection/f848078d-4f17-4e38-afed-7e3a85c7c7ec	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 09:50:45.629	2025-09-24 09:50:45.629
890	RYLS973UBCQWT	8ea96276-dc6e-429b-8019-ba06f5a346aa	https://app.midtrans.com/snap/v4/redirection/8ea96276-dc6e-429b-8019-ba06f5a346aa	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 10:13:16.339	2025-09-24 10:13:16.339
891	RYLS974FILTBTU	5737f930-908c-4be7-ae53-ff4e5a022326	https://app.midtrans.com/snap/v4/redirection/5737f930-908c-4be7-ae53-ff4e5a022326	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 10:24:14.556	2025-09-24 10:24:14.556
892	RYLS975ZFQXECG	c1ffe7eb-eac8-406e-8951-a5df906a95e8	https://app.midtrans.com/snap/v4/redirection/c1ffe7eb-eac8-406e-8951-a5df906a95e8	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 11:02:57.699	2025-09-24 11:02:57.699
893	RYLS976WLCME	d5e92778-c294-4fdd-993f-6b646f510c2e	https://app.midtrans.com/snap/v4/redirection/d5e92778-c294-4fdd-993f-6b646f510c2e	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 11:12:20.264	2025-09-24 11:12:20.264
894	RYLS977EEDKZHD	69a6622b-c349-4571-aa9a-28be09581b2e	https://app.midtrans.com/snap/v4/redirection/69a6622b-c349-4571-aa9a-28be09581b2e	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 11:26:07.431	2025-09-24 11:26:07.431
895	RYLS978KNITB	cf69a878-faf5-439b-9bc9-64478480855d	https://app.midtrans.com/snap/v4/redirection/cf69a878-faf5-439b-9bc9-64478480855d	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 11:28:30.933	2025-09-24 11:28:30.933
896	RYLS979WSQX	ea427f83-b434-496c-8649-28e91bc8f6b9	https://app.midtrans.com/snap/v4/redirection/ea427f83-b434-496c-8649-28e91bc8f6b9	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 12:02:30.583	2025-09-24 12:02:30.583
897	RYLS980OFQCH	081b87e7-4d19-48bc-98a7-b3489dffa3c2	https://app.midtrans.com/snap/v4/redirection/081b87e7-4d19-48bc-98a7-b3489dffa3c2	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 12:22:08.876	2025-09-24 12:22:08.876
898	RYLS981YEYIO	d2156195-ac28-4786-87e5-a619697954c8	https://app.midtrans.com/snap/v4/redirection/d2156195-ac28-4786-87e5-a619697954c8	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 14:20:02.079	2025-09-24 14:20:02.079
899	RYLS982WIVCDDS	53e957d6-2ddd-4530-824c-d67fcec21dbb	https://app.midtrans.com/snap/v4/redirection/53e957d6-2ddd-4530-824c-d67fcec21dbb	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 14:35:45.746	2025-09-24 14:35:45.746
900	RYLS983MQUCVQ	84a4e68b-761a-4901-91c8-160ef5ebda4a	https://app.midtrans.com/snap/v4/redirection/84a4e68b-761a-4901-91c8-160ef5ebda4a	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 15:45:44.03	2025-09-24 15:45:44.03
901	RYLS984KCRFVM	cd969493-2692-4d2c-b4e1-e2fdd0b970c5	https://app.midtrans.com/snap/v4/redirection/cd969493-2692-4d2c-b4e1-e2fdd0b970c5	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 16:09:09.817	2025-09-24 16:09:09.817
902	RYLS985FUMBDI	b371a03c-d503-4060-990f-f70d0afc6e14	https://app.midtrans.com/snap/v4/redirection/b371a03c-d503-4060-990f-f70d0afc6e14	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 16:09:33.924	2025-09-24 16:09:33.924
903	RYLS986CCOMOB	b5a02f4d-132d-46f5-98a8-574077c0a783	https://app.midtrans.com/snap/v4/redirection/b5a02f4d-132d-46f5-98a8-574077c0a783	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 16:22:16.829	2025-09-24 16:22:16.829
904	RYLS987SDLPWN	d9f6760a-da30-4865-952a-553dfcacb65d	https://app.midtrans.com/snap/v4/redirection/d9f6760a-da30-4865-952a-553dfcacb65d	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 17:02:00.443	2025-09-24 17:02:00.443
905	RYLS989HQMUZT	1c51c953-c4d8-43c6-ad26-be6ec28c126f	https://app.midtrans.com/snap/v4/redirection/1c51c953-c4d8-43c6-ad26-be6ec28c126f	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 17:56:31.385	2025-09-24 17:56:31.385
906	RYLS990URFRHMF	fd07af42-751f-497d-af01-7d93a2eea282	https://app.midtrans.com/snap/v4/redirection/fd07af42-751f-497d-af01-7d93a2eea282	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 21:22:06.82	2025-09-24 21:22:06.82
907	RYLS992QBFPZTY	21e36237-d515-41fc-be1f-88fda6bd3706	https://app.midtrans.com/snap/v4/redirection/21e36237-d515-41fc-be1f-88fda6bd3706	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 22:48:55.111	2025-09-24 22:48:55.111
908	RYLS993KKIKUI	04972259-edd3-4403-8dbf-86eadb0a48e6	https://app.midtrans.com/snap/v4/redirection/04972259-edd3-4403-8dbf-86eadb0a48e6	\N	\N	249281	IDR	pending	\N	{}	{}	\N	\N	2025-09-24 22:54:25.337	2025-09-24 22:54:25.337
909	RYLS994ZYSBB	5d172cbe-3dce-4cca-adab-ca4b51467a53	https://app.midtrans.com/snap/v4/redirection/5d172cbe-3dce-4cca-adab-ca4b51467a53	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 00:09:29.851	2025-09-25 00:09:29.851
910	RYLS995HXMT	efee1658-008c-424a-b357-37aae819870e	https://app.midtrans.com/snap/v4/redirection/efee1658-008c-424a-b357-37aae819870e	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 00:14:15.228	2025-09-25 00:14:15.228
911	RYLS996XNU	0bc5a818-e9d1-497b-b0d5-98840782125f	https://app.midtrans.com/snap/v4/redirection/0bc5a818-e9d1-497b-b0d5-98840782125f	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 00:16:46.361	2025-09-25 00:16:46.361
912	RYLS997BYGBN	41c75a25-41db-40db-a2f3-9deabf24d7e5	https://app.midtrans.com/snap/v4/redirection/41c75a25-41db-40db-a2f3-9deabf24d7e5	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 00:52:19.335	2025-09-25 00:52:19.335
913	RYLS998NBZDSM	de9174b5-e859-4792-a7e1-2748f97b1dc8	https://app.midtrans.com/snap/v4/redirection/de9174b5-e859-4792-a7e1-2748f97b1dc8	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 01:56:26.009	2025-09-25 01:56:26.009
914	RYLS999ZPWXSDJE	f2b71b30-6bb1-4d1c-9467-3cfab29ca0be	https://app.midtrans.com/snap/v4/redirection/f2b71b30-6bb1-4d1c-9467-3cfab29ca0be	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 02:13:38.472	2025-09-25 02:13:38.472
915	RYLS1000EAUMSE	a4646cb7-6826-4a77-8455-0900971617b4	https://app.midtrans.com/snap/v4/redirection/a4646cb7-6826-4a77-8455-0900971617b4	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 02:56:39.411	2025-09-25 02:56:39.411
916	RYLS1001UZZIOYG	5fd3bb83-61cd-4359-9471-69e03acce9f3	https://app.midtrans.com/snap/v4/redirection/5fd3bb83-61cd-4359-9471-69e03acce9f3	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 02:59:50.461	2025-09-25 02:59:50.461
917	RYLS1002NMAOB	8c794530-78bc-4591-a1cd-32745e83d94b	https://app.midtrans.com/snap/v4/redirection/8c794530-78bc-4591-a1cd-32745e83d94b	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 03:17:48.176	2025-09-25 03:17:48.176
918	RYLS1003HHJU	a7d95b07-3277-479d-ac7d-f9d8b0d84d1f	https://app.midtrans.com/snap/v4/redirection/a7d95b07-3277-479d-ac7d-f9d8b0d84d1f	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 03:23:11.289	2025-09-25 03:23:11.289
919	RYLS1006BUANCV	17f70088-6daa-4a2f-9098-ac8f03013bd1	https://app.midtrans.com/snap/v4/redirection/17f70088-6daa-4a2f-9098-ac8f03013bd1	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 03:57:34.352	2025-09-25 03:57:34.352
920	RYLS1007UROFN	26adbf9f-f0d5-4434-a087-e8851f88edbc	https://app.midtrans.com/snap/v4/redirection/26adbf9f-f0d5-4434-a087-e8851f88edbc	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 04:16:41.487	2025-09-25 04:16:41.487
921	RYLS1008IVQZDM	06ae6611-15c0-44c7-8092-ce9e89077fb6	https://app.midtrans.com/snap/v4/redirection/06ae6611-15c0-44c7-8092-ce9e89077fb6	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 04:21:06.436	2025-09-25 04:21:06.436
922	RYLS1009JZTIWHUZ	07e6cfee-07d9-41fb-ad77-83bd08b48827	https://app.midtrans.com/snap/v4/redirection/07e6cfee-07d9-41fb-ad77-83bd08b48827	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 04:25:00.031	2025-09-25 04:25:00.031
923	RYLS1010PUNXUO	b69953a9-6699-4755-bff8-8d5ee0358981	https://app.midtrans.com/snap/v4/redirection/b69953a9-6699-4755-bff8-8d5ee0358981	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 04:30:10.857	2025-09-25 04:30:10.857
924	RYLS1011LAMGKH	ecea1259-4033-403a-b75a-ba30a73a98a0	https://app.midtrans.com/snap/v4/redirection/ecea1259-4033-403a-b75a-ba30a73a98a0	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 04:32:43.696	2025-09-25 04:32:43.696
925	RYLS1012IKEOZZZ	032ac87d-8792-42ed-8c39-b74dc559cfbb	https://app.midtrans.com/snap/v4/redirection/032ac87d-8792-42ed-8c39-b74dc559cfbb	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 04:32:57.052	2025-09-25 04:32:57.052
926	RYLS1013KGFUDL	2f7a050e-ab69-4571-b9d2-ef07a472b738	https://app.midtrans.com/snap/v4/redirection/2f7a050e-ab69-4571-b9d2-ef07a472b738	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 04:37:04.433	2025-09-25 04:37:04.433
927	RYLS1014PXPOZ	a324d70b-c6bf-4bc9-aacd-f41e3132d5e0	https://app.midtrans.com/snap/v4/redirection/a324d70b-c6bf-4bc9-aacd-f41e3132d5e0	\N	\N	12492345	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 04:46:33.059	2025-09-25 04:46:33.059
928	RYLS1015XENTR	4d1ec3a5-f1f4-4b77-9499-5592b1d4c7db	https://app.midtrans.com/snap/v4/redirection/4d1ec3a5-f1f4-4b77-9499-5592b1d4c7db	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 04:49:10.985	2025-09-25 04:49:10.985
929	RYLS1016VXANSIO	29847662-8b83-4753-b77e-e88f7a283426	https://app.midtrans.com/snap/v4/redirection/29847662-8b83-4753-b77e-e88f7a283426	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 04:59:46.684	2025-09-25 04:59:46.684
930	RYLS1017VLBSETI	ff6d0791-b0ed-4b10-a785-616ee8395437	https://app.midtrans.com/snap/v4/redirection/ff6d0791-b0ed-4b10-a785-616ee8395437	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 05:02:24.069	2025-09-25 05:02:24.069
931	RYLS1018VMOLSJWC	bcbe8898-818f-4020-9249-a52430c5baba	https://app.midtrans.com/snap/v4/redirection/bcbe8898-818f-4020-9249-a52430c5baba	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 05:05:13.062	2025-09-25 05:05:13.062
932	RYLS1019PIFMHL	80ef8cb3-bde5-4802-b2f1-c2991245a85b	https://app.midtrans.com/snap/v4/redirection/80ef8cb3-bde5-4802-b2f1-c2991245a85b	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 05:27:31.386	2025-09-25 05:27:31.386
933	RYLS1020NAURNIT	875458e0-804a-459f-bc0f-292a26a0f88e	https://app.midtrans.com/snap/v4/redirection/875458e0-804a-459f-bc0f-292a26a0f88e	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 05:31:13.075	2025-09-25 05:31:13.075
934	RYLS1021JDKZE	6b48eb91-9cf3-4d1f-90f6-c01ebcc683db	https://app.midtrans.com/snap/v4/redirection/6b48eb91-9cf3-4d1f-90f6-c01ebcc683db	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 05:37:15.736	2025-09-25 05:37:15.736
935	RYLS1022EZRPUE	88ba4690-d29c-428d-a221-1f8933052ffa	https://app.midtrans.com/snap/v4/redirection/88ba4690-d29c-428d-a221-1f8933052ffa	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 05:45:08.064	2025-09-25 05:45:08.064
936	RYLS1024QYYMGI	caf697c2-ae19-49cb-95bc-851fb23458df	https://app.midtrans.com/snap/v4/redirection/caf697c2-ae19-49cb-95bc-851fb23458df	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 05:45:53.678	2025-09-25 05:45:53.678
937	RYLS1025MDYEM	91a87240-b22c-4ffa-99dc-d23edfd91f55	https://app.midtrans.com/snap/v4/redirection/91a87240-b22c-4ffa-99dc-d23edfd91f55	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 06:36:30.744	2025-09-25 06:36:30.744
938	RYLS1026AETEVC	dde55cd1-4448-4437-86dd-aea03bd85cd4	https://app.midtrans.com/snap/v4/redirection/dde55cd1-4448-4437-86dd-aea03bd85cd4	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 06:46:21.682	2025-09-25 06:46:21.682
939	RYLS1027KTURMA	cdf57ff4-99ab-457f-a668-3e6930dd6bb4	https://app.midtrans.com/snap/v4/redirection/cdf57ff4-99ab-457f-a668-3e6930dd6bb4	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 07:22:00.104	2025-09-25 07:22:00.104
940	RYLS1028EELGGBZ	6a03efab-0f10-4c5b-8f50-fae2e8387c04	https://app.midtrans.com/snap/v4/redirection/6a03efab-0f10-4c5b-8f50-fae2e8387c04	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 07:40:36.681	2025-09-25 07:40:36.681
941	RYLS1029DDAC	b9f83872-62c3-4b1d-a85c-3ecd259d676e	https://app.midtrans.com/snap/v4/redirection/b9f83872-62c3-4b1d-a85c-3ecd259d676e	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 08:46:21.096	2025-09-25 08:46:21.096
942	RYLS1030JRDNJHF	3a99bc8d-9d81-4386-8661-03dc85424bae	https://app.midtrans.com/snap/v4/redirection/3a99bc8d-9d81-4386-8661-03dc85424bae	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 09:06:09.872	2025-09-25 09:06:09.872
943	RYLS1031MIVUM	14ba6b41-b211-4d43-b949-3ab3ba14ef8d	https://app.midtrans.com/snap/v4/redirection/14ba6b41-b211-4d43-b949-3ab3ba14ef8d	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 09:10:07.441	2025-09-25 09:10:07.441
944	RYLS1032PPEXQ	3aba0811-945e-4d50-814e-defa391a8071	https://app.midtrans.com/snap/v4/redirection/3aba0811-945e-4d50-814e-defa391a8071	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 09:29:05.542	2025-09-25 09:29:05.542
945	RYLS1033BKKKGCND	041d77a0-de55-4d81-a148-60c1e5fc48e0	https://app.midtrans.com/snap/v4/redirection/041d77a0-de55-4d81-a148-60c1e5fc48e0	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 09:59:49.735	2025-09-25 09:59:49.735
946	RYLS1034HFHH	14c03b70-4009-4c76-b4b6-a72220bc8097	https://app.midtrans.com/snap/v4/redirection/14c03b70-4009-4c76-b4b6-a72220bc8097	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 10:14:28.957	2025-09-25 10:14:28.957
947	RYLS1035XWHCE	1548ebf6-fdb2-4344-98f1-8dc279b07d05	https://app.midtrans.com/snap/v4/redirection/1548ebf6-fdb2-4344-98f1-8dc279b07d05	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 11:37:36.398	2025-09-25 11:37:36.398
948	RYLS1036CKXMT	58ae22d5-9d38-4883-ba4d-98f6aa0ae7a8	https://app.midtrans.com/snap/v4/redirection/58ae22d5-9d38-4883-ba4d-98f6aa0ae7a8	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 12:03:19.881	2025-09-25 12:03:19.881
949	RYLS1037JFNYI	aa4d6274-7d83-4163-9dcd-3e8e45109ff6	https://app.midtrans.com/snap/v4/redirection/aa4d6274-7d83-4163-9dcd-3e8e45109ff6	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 12:08:10.574	2025-09-25 12:08:10.574
950	RYLS1038XAYYLI	4c87d2c6-2610-4422-94c7-ec2f4b3845f1	https://app.midtrans.com/snap/v4/redirection/4c87d2c6-2610-4422-94c7-ec2f4b3845f1	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 12:11:37.732	2025-09-25 12:11:37.732
951	RYLS1039BBG	2f304beb-cc43-40e8-a558-e3b36720ab46	https://app.midtrans.com/snap/v4/redirection/2f304beb-cc43-40e8-a558-e3b36720ab46	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 12:40:16.06	2025-09-25 12:40:16.06
952	RYLS1040TYUWBVIL	421a0155-f5fd-4825-8270-5b02d6a3de33	https://app.midtrans.com/snap/v4/redirection/421a0155-f5fd-4825-8270-5b02d6a3de33	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 13:15:26.409	2025-09-25 13:15:26.409
953	RYLS1041VUJY	538125e3-a53b-4de3-835c-3b0b53475a03	https://app.midtrans.com/snap/v4/redirection/538125e3-a53b-4de3-835c-3b0b53475a03	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 15:38:51.045	2025-09-25 15:38:51.045
954	RYLS1043GPQFLK	3482f785-ae52-4817-8fab-1f0c4a9eb877	https://app.midtrans.com/snap/v4/redirection/3482f785-ae52-4817-8fab-1f0c4a9eb877	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 16:04:31.4	2025-09-25 16:04:31.4
955	RYLS1044XXYEYIS	bf8e7998-7eb5-467e-90dd-195662ea6c43	https://app.midtrans.com/snap/v4/redirection/bf8e7998-7eb5-467e-90dd-195662ea6c43	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 16:28:23.836	2025-09-25 16:28:23.836
956	RYLS1045UQSCWFID	741db4fa-6c15-41ef-b503-10a104274528	https://app.midtrans.com/snap/v4/redirection/741db4fa-6c15-41ef-b503-10a104274528	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 17:16:34.216	2025-09-25 17:16:34.216
957	RYLS1046HHBQGK	b1df9b4d-ab3c-4910-947b-d346fa57c48d	https://app.midtrans.com/snap/v4/redirection/b1df9b4d-ab3c-4910-947b-d346fa57c48d	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 17:35:22.928	2025-09-25 17:35:22.928
958	RYLS1047BXGRRA	933c41e7-24f5-4cd9-adf7-e5fb53dad731	https://app.midtrans.com/snap/v4/redirection/933c41e7-24f5-4cd9-adf7-e5fb53dad731	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 17:39:19.449	2025-09-25 17:39:19.449
959	RYLS1048XWOZZDSQ	0e8b1c9a-5b6b-4ae4-8d28-74f724fde8b6	https://app.midtrans.com/snap/v4/redirection/0e8b1c9a-5b6b-4ae4-8d28-74f724fde8b6	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 18:47:03.442	2025-09-25 18:47:03.442
960	RYLS1049IUDR	e59f4efb-ac4c-4b93-92be-22af1e001dc9	https://app.midtrans.com/snap/v4/redirection/e59f4efb-ac4c-4b93-92be-22af1e001dc9	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 18:51:21.601	2025-09-25 18:51:21.601
961	RYLS1050WKUJA	5556cd99-b132-4e26-98c6-866ad055641c	https://app.midtrans.com/snap/v4/redirection/5556cd99-b132-4e26-98c6-866ad055641c	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 20:00:22.373	2025-09-25 20:00:22.373
962	RYLS1051VUVOM	afbfd43f-36e5-445a-8348-b91e145ae832	https://app.midtrans.com/snap/v4/redirection/afbfd43f-36e5-445a-8348-b91e145ae832	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 23:17:28.329	2025-09-25 23:17:28.329
963	RYLS1052TWNOEX	de319d15-593d-49e5-8102-e2ccec2ca096	https://app.midtrans.com/snap/v4/redirection/de319d15-593d-49e5-8102-e2ccec2ca096	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 23:18:22.41	2025-09-25 23:18:22.41
964	RYLS1053OULQOD	1ba356e4-f6d8-4d3f-acc7-cc0244613029	https://app.midtrans.com/snap/v4/redirection/1ba356e4-f6d8-4d3f-acc7-cc0244613029	\N	\N	249847	IDR	pending	\N	{}	{}	\N	\N	2025-09-25 23:20:18.606	2025-09-25 23:20:18.606
965	RYLS1054UXMQXEPJ	dbbff320-e904-4505-9534-5822149ee373	https://app.midtrans.com/snap/v4/redirection/dbbff320-e904-4505-9534-5822149ee373	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 01:17:51.056	2025-09-26 01:17:51.056
966	RYLS1055EGUPNI	349363c1-bb0e-4f9c-a29a-2b9d382b3c58	https://app.midtrans.com/snap/v4/redirection/349363c1-bb0e-4f9c-a29a-2b9d382b3c58	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 01:22:12.591	2025-09-26 01:22:12.591
967	RYLS1057NNLTQ	f9a6e659-9cd3-434d-8eff-de65584614d5	https://app.midtrans.com/snap/v4/redirection/f9a6e659-9cd3-434d-8eff-de65584614d5	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 03:27:08.858	2025-09-26 03:27:08.858
968	RYLS1058TQRXWTU	29d5af5b-c32a-4e1b-81d5-b752d631d6c1	https://app.midtrans.com/snap/v4/redirection/29d5af5b-c32a-4e1b-81d5-b752d631d6c1	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 03:36:36.746	2025-09-26 03:36:36.746
969	RYLS1059TQNNFFH	962b86c1-9152-4c97-bec6-2211ba19e2bc	https://app.midtrans.com/snap/v4/redirection/962b86c1-9152-4c97-bec6-2211ba19e2bc	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 03:45:40.208	2025-09-26 03:45:40.208
970	RYLS1060IFJY	9e7f3c64-a0f1-4c36-a453-974e45900744	https://app.midtrans.com/snap/v4/redirection/9e7f3c64-a0f1-4c36-a453-974e45900744	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 05:26:28.659	2025-09-26 05:26:28.659
971	RYLS1061ANEXALE	3ec1bebc-e3d1-44a1-8b4d-c212345151a8	https://app.midtrans.com/snap/v4/redirection/3ec1bebc-e3d1-44a1-8b4d-c212345151a8	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 06:16:54.219	2025-09-26 06:16:54.219
972	RYLS1064EPVACX	f18489a0-83c1-4bdb-b5dc-9257b069c22a	https://app.midtrans.com/snap/v4/redirection/f18489a0-83c1-4bdb-b5dc-9257b069c22a	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 06:31:54.018	2025-09-26 06:31:54.018
973	RYLS1065TLMOAC	dd9711db-4ca4-4464-b57c-9d09fe21e0f7	https://app.midtrans.com/snap/v4/redirection/dd9711db-4ca4-4464-b57c-9d09fe21e0f7	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 06:45:21.503	2025-09-26 06:45:21.503
974	RYLS1066PZPW	92274039-b623-4c3d-94d5-174b3b95f064	https://app.midtrans.com/snap/v4/redirection/92274039-b623-4c3d-94d5-174b3b95f064	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 07:12:07.896	2025-09-26 07:12:07.896
975	RYLS1067PYSONER	cadb736b-4139-432f-9514-8ef8596013d8	https://app.midtrans.com/snap/v4/redirection/cadb736b-4139-432f-9514-8ef8596013d8	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 07:33:12.85	2025-09-26 07:33:12.85
976	RYLS1069JAIJUWC	035ad193-88fc-4c27-9555-514972e5716e	https://app.midtrans.com/snap/v4/redirection/035ad193-88fc-4c27-9555-514972e5716e	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 09:05:35.185	2025-09-26 09:05:35.185
977	RYLS1071EATQSMF	a70cd791-46f8-41c3-bd64-28cbab0b6171	https://app.midtrans.com/snap/v4/redirection/a70cd791-46f8-41c3-bd64-28cbab0b6171	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 11:08:24.842	2025-09-26 11:08:24.842
978	RYLS1072DYEKUW	c5d1ef63-781a-4e6a-9955-fc2eca07bf66	https://app.midtrans.com/snap/v4/redirection/c5d1ef63-781a-4e6a-9955-fc2eca07bf66	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 11:49:13.261	2025-09-26 11:49:13.261
979	RYLS1074ARSNJN	9abe33fe-4348-43ed-a3d0-8846ad554f04	https://app.midtrans.com/snap/v4/redirection/9abe33fe-4348-43ed-a3d0-8846ad554f04	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 12:56:51.486	2025-09-26 12:56:51.486
980	RYLS1075BTBNG	c2c5a833-43c8-4f36-a553-cc253804c1dd	https://app.midtrans.com/snap/v4/redirection/c2c5a833-43c8-4f36-a553-cc253804c1dd	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 13:01:15.958	2025-09-26 13:01:15.958
981	RYLS1076ZWOSRW	7acd1efc-1192-445b-b3ff-ace7b8f2e7aa	https://app.midtrans.com/snap/v4/redirection/7acd1efc-1192-445b-b3ff-ace7b8f2e7aa	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 13:19:41.69	2025-09-26 13:19:41.69
982	RYLS1077QBMOYL	4efd9f1b-6292-4996-9e5f-475d6d96c242	https://app.midtrans.com/snap/v4/redirection/4efd9f1b-6292-4996-9e5f-475d6d96c242	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 13:33:55.02	2025-09-26 13:33:55.02
983	RYLS1079GYVE	186a3fe1-7830-48f0-9a8b-44a471d9fd07	https://app.midtrans.com/snap/v4/redirection/186a3fe1-7830-48f0-9a8b-44a471d9fd07	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 13:39:04.183	2025-09-26 13:39:04.183
984	RYLS1080OXHTPL	b47b33a6-d80b-401c-afbb-45543cef52e4	https://app.midtrans.com/snap/v4/redirection/b47b33a6-d80b-401c-afbb-45543cef52e4	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 13:48:28.708	2025-09-26 13:48:28.708
985	RYLS1081LDOGJY	67bbccc3-a99a-4382-982c-b2238a7b7aa9	https://app.midtrans.com/snap/v4/redirection/67bbccc3-a99a-4382-982c-b2238a7b7aa9	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 13:59:13.734	2025-09-26 13:59:13.734
986	RYLS1082OXFJCVY	bde63e03-661c-4e9b-8080-642d8354ef10	https://app.midtrans.com/snap/v4/redirection/bde63e03-661c-4e9b-8080-642d8354ef10	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 14:27:56.564	2025-09-26 14:27:56.564
987	RYLS1083OKUJIG	3085eb24-de5a-4362-b0a1-8863ed95e642	https://app.midtrans.com/snap/v4/redirection/3085eb24-de5a-4362-b0a1-8863ed95e642	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 14:34:11.879	2025-09-26 14:34:11.879
988	RYLS1084NXZJUTH	0aeebb33-8b62-4cb1-bbe5-f2d0c7488f67	https://app.midtrans.com/snap/v4/redirection/0aeebb33-8b62-4cb1-bbe5-f2d0c7488f67	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 14:34:41.599	2025-09-26 14:34:41.599
989	RYLS1085TSDXLO	ca83247f-a45d-4e9a-8171-c51bca3e2da4	https://app.midtrans.com/snap/v4/redirection/ca83247f-a45d-4e9a-8171-c51bca3e2da4	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 14:47:02.404	2025-09-26 14:47:02.404
990	RYLS1086VWZLPP	3fba63f3-d439-462d-9ec2-39288713480a	https://app.midtrans.com/snap/v4/redirection/3fba63f3-d439-462d-9ec2-39288713480a	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 16:09:16.478	2025-09-26 16:09:16.478
991	RYLS1087ABGOKW	03bab7ec-76b5-4f09-94b0-775cd07969d2	https://app.midtrans.com/snap/v4/redirection/03bab7ec-76b5-4f09-94b0-775cd07969d2	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 16:29:58.651	2025-09-26 16:29:58.651
992	RYLS1088DWFQBU	cf8f1086-15bf-4217-bf04-10bb4fd89619	https://app.midtrans.com/snap/v4/redirection/cf8f1086-15bf-4217-bf04-10bb4fd89619	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 16:31:33.541	2025-09-26 16:31:33.541
993	RYLS1089SCVC	19ce818d-a723-4241-937a-832a8fdfd0d3	https://app.midtrans.com/snap/v4/redirection/19ce818d-a723-4241-937a-832a8fdfd0d3	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 17:03:53.559	2025-09-26 17:03:53.559
994	RYLS1090QODRX	9901caf4-ed0c-4618-878c-0ccc7bacc9ed	https://app.midtrans.com/snap/v4/redirection/9901caf4-ed0c-4618-878c-0ccc7bacc9ed	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 17:06:54.906	2025-09-26 17:06:54.906
995	RYLS1091NXSDSM	397fdf07-2419-481f-ab0f-059c69c9ff80	https://app.midtrans.com/snap/v4/redirection/397fdf07-2419-481f-ab0f-059c69c9ff80	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 17:09:33.784	2025-09-26 17:09:33.784
996	RYLS1092CILZN	690e3d61-097b-4fd9-b021-e83020c0a392	https://app.midtrans.com/snap/v4/redirection/690e3d61-097b-4fd9-b021-e83020c0a392	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 17:48:42.143	2025-09-26 17:48:42.143
997	RYLS1093DQDE	e5842e2e-c4f7-4726-bffc-f76c4bf94051	https://app.midtrans.com/snap/v4/redirection/e5842e2e-c4f7-4726-bffc-f76c4bf94051	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 18:49:09.452	2025-09-26 18:49:09.452
998	RYLS1094GESV	0b2a025f-dd9e-4242-91a3-705ac057cf6b	https://app.midtrans.com/snap/v4/redirection/0b2a025f-dd9e-4242-91a3-705ac057cf6b	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 18:51:03.267	2025-09-26 18:51:03.267
999	RYLS1095QZJLZVM	34bac132-259a-4cd6-97be-5a4cf0da0584	https://app.midtrans.com/snap/v4/redirection/34bac132-259a-4cd6-97be-5a4cf0da0584	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 19:30:28.482	2025-09-26 19:30:28.482
1000	RYLS1096TCBUZV	b76382fd-5ce1-4a87-ad1f-011b6c1de631	https://app.midtrans.com/snap/v4/redirection/b76382fd-5ce1-4a87-ad1f-011b6c1de631	\N	\N	251076	IDR	pending	\N	{}	{}	\N	\N	2025-09-26 19:31:15.095	2025-09-26 19:31:15.095
1001	RYLS1097DSEBSIZ	ab47ff03-95e2-45a4-b4e6-886ba8daca49	https://app.midtrans.com/snap/v4/redirection/ab47ff03-95e2-45a4-b4e6-886ba8daca49	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 02:07:04.079	2025-09-27 02:07:04.079
1002	RYLS1098XQZMBGW	fd39ab81-377a-4afd-bb17-52f24f107302	https://app.midtrans.com/snap/v4/redirection/fd39ab81-377a-4afd-bb17-52f24f107302	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 02:25:46.821	2025-09-27 02:25:46.821
1003	RYLS1099PLTENN	cd091a28-e5eb-4809-846e-24ac02ae4379	https://app.midtrans.com/snap/v4/redirection/cd091a28-e5eb-4809-846e-24ac02ae4379	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 02:30:31.987	2025-09-27 02:30:31.987
1004	RYLS1100ILGOLXU	e218e2de-14fd-44f1-84b5-f1f53e69a681	https://app.midtrans.com/snap/v4/redirection/e218e2de-14fd-44f1-84b5-f1f53e69a681	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 03:21:04.363	2025-09-27 03:21:04.363
1005	RYLS1101DWFIWWA	ed680601-19ca-4548-8693-0575b2e4c9e0	https://app.midtrans.com/snap/v4/redirection/ed680601-19ca-4548-8693-0575b2e4c9e0	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 03:48:49.729	2025-09-27 03:48:49.729
1006	RYLS1102HDLPKU	74f7bc6b-b973-48b8-9141-ead6ed5ae209	https://app.midtrans.com/snap/v4/redirection/74f7bc6b-b973-48b8-9141-ead6ed5ae209	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 03:54:59.506	2025-09-27 03:54:59.506
1007	RYLS1103GEYNF	b5063f4d-cc5c-44e2-92de-dbb3351001ed	https://app.midtrans.com/snap/v4/redirection/b5063f4d-cc5c-44e2-92de-dbb3351001ed	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 04:04:16.187	2025-09-27 04:04:16.187
1008	RYLS1104QKLIG	d19b5d6d-2e0a-4a16-999e-3f62f2c3ea09	https://app.midtrans.com/snap/v4/redirection/d19b5d6d-2e0a-4a16-999e-3f62f2c3ea09	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 05:17:53.234	2025-09-27 05:17:53.234
1009	RYLS1105EEVEJO	1ae9d675-6b5d-463b-931b-5f6e8f8b1b94	https://app.midtrans.com/snap/v4/redirection/1ae9d675-6b5d-463b-931b-5f6e8f8b1b94	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 05:37:13.573	2025-09-27 05:37:13.573
1010	RYLS1106XVJTJ	849de672-4f00-473c-b17e-1e220032d2c9	https://app.midtrans.com/snap/v4/redirection/849de672-4f00-473c-b17e-1e220032d2c9	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 06:59:50.622	2025-09-27 06:59:50.622
1011	RYLS1107ZFTVCBK	5160f180-f1dc-40e6-88a1-785a419bb3d3	https://app.midtrans.com/snap/v4/redirection/5160f180-f1dc-40e6-88a1-785a419bb3d3	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 07:07:21.652	2025-09-27 07:07:21.652
1012	RYLS1108KVHLJME	eca898d9-a370-45f0-ac09-3400b5e90a77	https://app.midtrans.com/snap/v4/redirection/eca898d9-a370-45f0-ac09-3400b5e90a77	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 08:25:16.649	2025-09-27 08:25:16.649
1013	RYLS1109KYGT	5dd14de1-bf26-4eb6-8dcf-0aa13a6e8a03	https://app.midtrans.com/snap/v4/redirection/5dd14de1-bf26-4eb6-8dcf-0aa13a6e8a03	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 08:29:49.105	2025-09-27 08:29:49.105
1014	RYLS1110FNQV	93f321c8-17a2-4936-90fd-a87a1fa6527b	https://app.midtrans.com/snap/v4/redirection/93f321c8-17a2-4936-90fd-a87a1fa6527b	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 08:31:03.357	2025-09-27 08:31:03.357
1015	RYLS1111UGQYS	88ddc885-cdb0-42c3-b199-59071ae7000d	https://app.midtrans.com/snap/v4/redirection/88ddc885-cdb0-42c3-b199-59071ae7000d	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 08:40:50.431	2025-09-27 08:40:50.431
1016	RYLS1112ZEVUY	9cb172d1-0ed5-478e-a4aa-769085ecb58f	https://app.midtrans.com/snap/v4/redirection/9cb172d1-0ed5-478e-a4aa-769085ecb58f	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 09:07:37.886	2025-09-27 09:07:37.886
1017	RYLS1113BXERV	85e1bf15-e483-418b-a37f-cd7b68c486d0	https://app.midtrans.com/snap/v4/redirection/85e1bf15-e483-418b-a37f-cd7b68c486d0	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 09:40:18.609	2025-09-27 09:40:18.609
1018	RYLS1114PRHY	5e918269-821c-4b8c-bbed-48ec9335c7c9	https://app.midtrans.com/snap/v4/redirection/5e918269-821c-4b8c-bbed-48ec9335c7c9	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 09:42:51.885	2025-09-27 09:42:51.885
1019	RYLS1116TPVXH	11b29a93-89a7-4e4e-8929-a5e6d9186079	https://app.midtrans.com/snap/v4/redirection/11b29a93-89a7-4e4e-8929-a5e6d9186079	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 10:41:25.588	2025-09-27 10:41:25.588
1020	RYLS1118WTCDKT	d8d74ab7-4e6f-45b0-9164-cf4cbfba42e1	https://app.midtrans.com/snap/v4/redirection/d8d74ab7-4e6f-45b0-9164-cf4cbfba42e1	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 11:40:56.9	2025-09-27 11:40:56.9
1021	RYLS1119UAYZSKEB	6a133166-9421-4709-88f4-71361a9b2900	https://app.midtrans.com/snap/v4/redirection/6a133166-9421-4709-88f4-71361a9b2900	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 12:02:51.593	2025-09-27 12:02:51.593
1022	RYLS1120SHMYRNB	790856ab-e781-49d5-9ff0-1e52efce0508	https://app.midtrans.com/snap/v4/redirection/790856ab-e781-49d5-9ff0-1e52efce0508	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 12:20:00.627	2025-09-27 12:20:00.627
1023	RYLS1121AWLPI	11502f7f-1d73-4aaa-aefc-a23e8c51ffb9	https://app.midtrans.com/snap/v4/redirection/11502f7f-1d73-4aaa-aefc-a23e8c51ffb9	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 12:22:37.38	2025-09-27 12:22:37.38
1024	RYLS1122NUVRDFT	32e95d0c-16a0-450c-b727-176cd2dd8bb8	https://app.midtrans.com/snap/v4/redirection/32e95d0c-16a0-450c-b727-176cd2dd8bb8	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 13:08:04.41	2025-09-27 13:08:04.41
1025	RYLS1123JIZTRVX	bf12c7c4-a682-4b5d-bc12-02f884fc3fd1	https://app.midtrans.com/snap/v4/redirection/bf12c7c4-a682-4b5d-bc12-02f884fc3fd1	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 13:27:56.769	2025-09-27 13:27:56.769
1026	RYLS1124TADNUVR	0dcd11bd-1643-42d9-b15a-f636fce7157f	https://app.midtrans.com/snap/v4/redirection/0dcd11bd-1643-42d9-b15a-f636fce7157f	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 14:00:46.669	2025-09-27 14:00:46.669
1027	RYLS1125GLAXU	29797b86-5e56-4997-86b0-5cfc7d474157	https://app.midtrans.com/snap/v4/redirection/29797b86-5e56-4997-86b0-5cfc7d474157	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 14:15:45.128	2025-09-27 14:15:45.128
1028	RYLS1126OYOXAJA	683ff3d6-c8e4-4b4f-a2cf-f489ba81194b	https://app.midtrans.com/snap/v4/redirection/683ff3d6-c8e4-4b4f-a2cf-f489ba81194b	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 14:16:45.681	2025-09-27 14:16:45.681
1029	RYLS1127LTNPRBB	5178fd70-c942-43b9-b52c-bf3861499d83	https://app.midtrans.com/snap/v4/redirection/5178fd70-c942-43b9-b52c-bf3861499d83	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 14:18:39.947	2025-09-27 14:18:39.947
1030	RYLS1131SSKVJTY	e8a3f3c3-a08f-470a-89b7-7272e48f8d77	https://app.midtrans.com/snap/v4/redirection/e8a3f3c3-a08f-470a-89b7-7272e48f8d77	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 15:20:16.328	2025-09-27 15:20:16.328
1031	RYLS1133WDEGX	e94d7629-4562-484a-b010-2a304bb352f1	https://app.midtrans.com/snap/v4/redirection/e94d7629-4562-484a-b010-2a304bb352f1	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 16:42:26.814	2025-09-27 16:42:26.814
1032	RYLS1134HVRDJ	e97ea27f-f450-46df-90a3-c0ecfd9e4ecc	https://app.midtrans.com/snap/v4/redirection/e97ea27f-f450-46df-90a3-c0ecfd9e4ecc	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 17:07:27.573	2025-09-27 17:07:27.573
1033	RYLS1135KFSYJ	00481819-0671-4d02-a01c-94475149b285	https://app.midtrans.com/snap/v4/redirection/00481819-0671-4d02-a01c-94475149b285	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 20:27:51.165	2025-09-27 20:27:51.165
1034	RYLS1136BMOBZTX	83a9d322-638f-435f-aed4-db5a224582c0	https://app.midtrans.com/snap/v4/redirection/83a9d322-638f-435f-aed4-db5a224582c0	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 21:46:30.66	2025-09-27 21:46:30.66
1035	RYLS1138UZGRE	354ffec4-1cd9-46ea-822e-13e0e2d6a4b4	https://app.midtrans.com/snap/v4/redirection/354ffec4-1cd9-46ea-822e-13e0e2d6a4b4	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-27 23:55:20.513	2025-09-27 23:55:20.513
1036	RYLS1139SFSJWKT	cfef4d01-98b0-44d1-8a07-85ca96f8fdb9	https://app.midtrans.com/snap/v4/redirection/cfef4d01-98b0-44d1-8a07-85ca96f8fdb9	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 00:16:51.629	2025-09-28 00:16:51.629
1037	RYLS1140EYVWKSR	2a99ffb9-0beb-43e7-bd82-02d263d63a9c	https://app.midtrans.com/snap/v4/redirection/2a99ffb9-0beb-43e7-bd82-02d263d63a9c	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 01:01:20.014	2025-09-28 01:01:20.014
1038	RYLS1141AMDUXL	dc890825-794f-4985-9e68-a55de23e1c0c	https://app.midtrans.com/snap/v4/redirection/dc890825-794f-4985-9e68-a55de23e1c0c	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 01:08:49.841	2025-09-28 01:08:49.841
1039	RYLS1143WFYZYZW	9b1b31ad-b31d-4315-b36a-62c96db69de1	https://app.midtrans.com/snap/v4/redirection/9b1b31ad-b31d-4315-b36a-62c96db69de1	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 03:28:35.716	2025-09-28 03:28:35.716
1040	RYLS1144AJW	47ae9a45-eeaa-435a-a7fa-cc1a1cc833a5	https://app.midtrans.com/snap/v4/redirection/47ae9a45-eeaa-435a-a7fa-cc1a1cc833a5	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 03:49:06.789	2025-09-28 03:49:06.789
1041	RYLS1145GYFVI	f2237fbf-fd50-4503-ae8d-c95f835d0fba	https://app.midtrans.com/snap/v4/redirection/f2237fbf-fd50-4503-ae8d-c95f835d0fba	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 04:00:52.408	2025-09-28 04:00:52.408
1042	RYLS1146GIUFQM	44846e47-7e1f-4e71-b83c-41bae39204fc	https://app.midtrans.com/snap/v4/redirection/44846e47-7e1f-4e71-b83c-41bae39204fc	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 05:18:08.608	2025-09-28 05:18:08.608
1043	RYLS1147HLBEVN	099c4089-707f-4fce-b81b-26882d9a55d7	https://app.midtrans.com/snap/v4/redirection/099c4089-707f-4fce-b81b-26882d9a55d7	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 05:31:45.378	2025-09-28 05:31:45.378
1044	RYLS1149YXKCIIT	57e5bbd3-d270-4a82-bf82-0b2dc93f0613	https://app.midtrans.com/snap/v4/redirection/57e5bbd3-d270-4a82-bf82-0b2dc93f0613	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 05:46:43.921	2025-09-28 05:46:43.921
1045	RYLS1150CZDUXXI	c5e8f6f8-4b17-4275-ba4b-fb1be6372684	https://app.midtrans.com/snap/v4/redirection/c5e8f6f8-4b17-4275-ba4b-fb1be6372684	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 07:08:59.54	2025-09-28 07:08:59.54
1046	RYLS1151BOZND	d6267b42-ea47-417f-af52-652705ed049b	https://app.midtrans.com/snap/v4/redirection/d6267b42-ea47-417f-af52-652705ed049b	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 07:42:20.435	2025-09-28 07:42:20.435
1047	RYLS1152MHGMJ	58a6a88c-7b99-4639-b132-b57dc03e3785	https://app.midtrans.com/snap/v4/redirection/58a6a88c-7b99-4639-b132-b57dc03e3785	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 07:51:05.646	2025-09-28 07:51:05.646
1048	RYLS1153LVNO	0a4d92ca-e084-43c3-b8f0-e09339493485	https://app.midtrans.com/snap/v4/redirection/0a4d92ca-e084-43c3-b8f0-e09339493485	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 08:01:00.723	2025-09-28 08:01:00.723
1049	RYLS1154POQFDS	e3d19f0b-4bbe-45d9-9156-5ad161f20e3f	https://app.midtrans.com/snap/v4/redirection/e3d19f0b-4bbe-45d9-9156-5ad161f20e3f	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 08:37:31.379	2025-09-28 08:37:31.379
1050	RYLS1155BLWYMW	082989b4-88d5-470e-a8d2-773680e25816	https://app.midtrans.com/snap/v4/redirection/082989b4-88d5-470e-a8d2-773680e25816	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 09:25:36.408	2025-09-28 09:25:36.408
1051	RYLS1156IIKSIY	6e927aa4-2d46-4ac6-95b4-8ab57a52cb29	https://app.midtrans.com/snap/v4/redirection/6e927aa4-2d46-4ac6-95b4-8ab57a52cb29	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 09:34:35.274	2025-09-28 09:34:35.274
1052	RYLS1157PXJKDJ	95668dc1-54cd-4edb-8bbf-7df38d82fb6d	https://app.midtrans.com/snap/v4/redirection/95668dc1-54cd-4edb-8bbf-7df38d82fb6d	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 10:33:14.105	2025-09-28 10:33:14.105
1053	RYLS1158OKBHT	41f51e38-5ad6-4524-9203-daf990860866	https://app.midtrans.com/snap/v4/redirection/41f51e38-5ad6-4524-9203-daf990860866	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 10:46:03.366	2025-09-28 10:46:03.366
1054	RYLS1159DEAT	1bc13afe-eb37-474b-b4bd-d66d67418ed7	https://app.midtrans.com/snap/v4/redirection/1bc13afe-eb37-474b-b4bd-d66d67418ed7	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 10:50:18.701	2025-09-28 10:50:18.701
1055	RYLS1160YSQTY	7d4331e0-b4c8-4134-b48c-6e5ec5710bed	https://app.midtrans.com/snap/v4/redirection/7d4331e0-b4c8-4134-b48c-6e5ec5710bed	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 11:06:03.792	2025-09-28 11:06:03.792
1056	RYLS1161KTAFV	07f438ea-4ae2-430b-a363-f09717470760	https://app.midtrans.com/snap/v4/redirection/07f438ea-4ae2-430b-a363-f09717470760	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 12:40:32.472	2025-09-28 12:40:32.472
1057	RYLS1162WWBGXW	e6d9a07a-ebb3-4c33-b38c-6cfe0eb2149a	https://app.midtrans.com/snap/v4/redirection/e6d9a07a-ebb3-4c33-b38c-6cfe0eb2149a	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 12:59:51.45	2025-09-28 12:59:51.45
1058	RYLS1163CJFD	aee40ab0-73c9-4510-841c-038322d1dc87	https://app.midtrans.com/snap/v4/redirection/aee40ab0-73c9-4510-841c-038322d1dc87	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 13:49:26.904	2025-09-28 13:49:26.904
1059	RYLS1164MOEGBT	7d6c5966-0a81-4534-8ff2-f6c2e5fa0365	https://app.midtrans.com/snap/v4/redirection/7d6c5966-0a81-4534-8ff2-f6c2e5fa0365	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 14:07:47.17	2025-09-28 14:07:47.17
1060	RYLS1165KXNHKI	2e076287-c6c3-470b-bc93-2dc77a185fca	https://app.midtrans.com/snap/v4/redirection/2e076287-c6c3-470b-bc93-2dc77a185fca	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 15:02:10.327	2025-09-28 15:02:10.327
1061	RYLS1166KHBZR	46ccca22-0fa4-4ee6-b82c-343c4af766ef	https://app.midtrans.com/snap/v4/redirection/46ccca22-0fa4-4ee6-b82c-343c4af766ef	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 15:15:51.453	2025-09-28 15:15:51.453
1062	RYLS1167DCIBQL	b59f338e-bb79-4ad7-b9a6-722b4ff7cebc	https://app.midtrans.com/snap/v4/redirection/b59f338e-bb79-4ad7-b9a6-722b4ff7cebc	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 15:20:52.537	2025-09-28 15:20:52.537
1063	RYLS1168JJNN	d7cb52c9-39ac-44ef-9671-f4402ed68d79	https://app.midtrans.com/snap/v4/redirection/d7cb52c9-39ac-44ef-9671-f4402ed68d79	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 15:36:51.968	2025-09-28 15:36:51.968
1064	RYLS1169DBNHKS	b67f8155-8058-4974-832b-041af46b9680	https://app.midtrans.com/snap/v4/redirection/b67f8155-8058-4974-832b-041af46b9680	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 15:41:04.657	2025-09-28 15:41:04.657
1065	RYLS1171JOBEY	dfca7cef-3ec1-4038-9450-5c4e29e342af	https://app.midtrans.com/snap/v4/redirection/dfca7cef-3ec1-4038-9450-5c4e29e342af	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 16:03:35.395	2025-09-28 16:03:35.395
1066	RYLS1172PNNWHR	78d15445-aa96-4c6c-9490-3c714a4be5be	https://app.midtrans.com/snap/v4/redirection/78d15445-aa96-4c6c-9490-3c714a4be5be	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 16:04:14.449	2025-09-28 16:04:14.449
1067	RYLS1173GTNHFXJ	52a9b471-2660-470a-a105-e3a2e45fec63	https://app.midtrans.com/snap/v4/redirection/52a9b471-2660-470a-a105-e3a2e45fec63	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 17:00:14.934	2025-09-28 17:00:14.934
1068	RYLS1174AYMWO	34bee02f-251d-4b4d-b8ba-c9845351461b	https://app.midtrans.com/snap/v4/redirection/34bee02f-251d-4b4d-b8ba-c9845351461b	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 17:24:58.348	2025-09-28 17:24:58.348
1069	RYLS1175TFJJHTIN	bf92cbdc-21e3-42df-83c9-44a999b30864	https://app.midtrans.com/snap/v4/redirection/bf92cbdc-21e3-42df-83c9-44a999b30864	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 18:08:09.631	2025-09-28 18:08:09.631
1070	RYLS1176BNYLVFR	3aa2f27c-fc4d-4d83-af45-7636826015c3	https://app.midtrans.com/snap/v4/redirection/3aa2f27c-fc4d-4d83-af45-7636826015c3	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 18:38:41.234	2025-09-28 18:38:41.234
1071	RYLS1177NFPPOI	ed9407e0-3f26-4ec4-b230-f20ce4018cf3	https://app.midtrans.com/snap/v4/redirection/ed9407e0-3f26-4ec4-b230-f20ce4018cf3	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 18:54:48.315	2025-09-28 18:54:48.315
1072	RYLS1179ILU	55493596-5a95-4e19-830c-c538499ad97a	https://app.midtrans.com/snap/v4/redirection/55493596-5a95-4e19-830c-c538499ad97a	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 19:54:11.036	2025-09-28 19:54:11.036
1073	RYLS1180VTBVTM	a6435440-f952-4f9c-b242-aae8267c43ba	https://app.midtrans.com/snap/v4/redirection/a6435440-f952-4f9c-b242-aae8267c43ba	\N	\N	251304	IDR	pending	\N	{}	{}	\N	\N	2025-09-28 23:29:44.618	2025-09-28 23:29:44.618
1074	RYLS1181FHXLA	2df8f78c-5660-4d91-8d7d-d9a3e0b6bccd	https://app.midtrans.com/snap/v4/redirection/2df8f78c-5660-4d91-8d7d-d9a3e0b6bccd	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 00:39:58.214	2025-09-29 00:39:58.214
1075	RYLS1182AASNN	90230963-b11a-49f2-84a0-a0f013b4fc06	https://app.midtrans.com/snap/v4/redirection/90230963-b11a-49f2-84a0-a0f013b4fc06	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 01:14:11.705	2025-09-29 01:14:11.705
1076	RYLS1183YLOIAVBI	d7516396-da61-40bf-9707-440e5eb30b90	https://app.midtrans.com/snap/v4/redirection/d7516396-da61-40bf-9707-440e5eb30b90	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 01:16:25.308	2025-09-29 01:16:25.308
1077	RYLS1184LHTLBTEB	cdef879c-3d97-4d28-b0a2-5a799725ca3c	https://app.midtrans.com/snap/v4/redirection/cdef879c-3d97-4d28-b0a2-5a799725ca3c	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 01:19:08.387	2025-09-29 01:19:08.387
1078	RYLS1185RKXZJY	eb67cf6d-e2cc-40c3-89e7-7a336621c017	https://app.midtrans.com/snap/v4/redirection/eb67cf6d-e2cc-40c3-89e7-7a336621c017	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 01:45:02.992	2025-09-29 01:45:02.992
1079	RYLS1186MYZAHNM	eea87b04-11ca-4289-b9bc-ce313b8c3b80	https://app.midtrans.com/snap/v4/redirection/eea87b04-11ca-4289-b9bc-ce313b8c3b80	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 01:53:48.39	2025-09-29 01:53:48.39
1080	RYLS1187DWAC	832851b0-3a7e-485e-a95c-18811f446230	https://app.midtrans.com/snap/v4/redirection/832851b0-3a7e-485e-a95c-18811f446230	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 02:23:37.05	2025-09-29 02:23:37.05
1081	RYLS1188ARNGFW	182cc177-4688-4a38-b889-73cbbe817221	https://app.midtrans.com/snap/v4/redirection/182cc177-4688-4a38-b889-73cbbe817221	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 02:46:52.598	2025-09-29 02:46:52.598
1082	RYLS1189BHUT	e1df1197-1c2d-4e9b-bb7f-720d5f56ef41	https://app.midtrans.com/snap/v4/redirection/e1df1197-1c2d-4e9b-bb7f-720d5f56ef41	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 02:54:58.693	2025-09-29 02:54:58.693
1083	RYLS1190CCKPUQ	2bacbf66-baad-4ffb-8005-7ad822a28c0d	https://app.midtrans.com/snap/v4/redirection/2bacbf66-baad-4ffb-8005-7ad822a28c0d	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 03:19:53.888	2025-09-29 03:19:53.888
1084	RYLS1191TXPGJGAL	6874c5ae-e4b0-4c66-bc7d-ab042029563f	https://app.midtrans.com/snap/v4/redirection/6874c5ae-e4b0-4c66-bc7d-ab042029563f	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 03:44:47.452	2025-09-29 03:44:47.452
1085	RYLS1192VPKHGH	03e8d353-4853-4853-9760-4bd01a64d44e	https://app.midtrans.com/snap/v4/redirection/03e8d353-4853-4853-9760-4bd01a64d44e	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 03:52:46.43	2025-09-29 03:52:46.43
1086	RYLS1193QIYUVMUL	6a022da6-521e-4349-9eb5-173483f8019a	https://app.midtrans.com/snap/v4/redirection/6a022da6-521e-4349-9eb5-173483f8019a	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 04:20:50.281	2025-09-29 04:20:50.281
1087	RYLS1194AWSZN	6da13415-e5e9-487c-9edc-3d294ce0e2d3	https://app.midtrans.com/snap/v4/redirection/6da13415-e5e9-487c-9edc-3d294ce0e2d3	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 04:21:23.382	2025-09-29 04:21:23.382
1088	RYLS1195ADULC	903118fc-cd30-41ae-97e1-f8b2b1f5de31	https://app.midtrans.com/snap/v4/redirection/903118fc-cd30-41ae-97e1-f8b2b1f5de31	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 04:21:27.787	2025-09-29 04:21:27.787
1089	RYLS1196TROUYF	1c1baff4-89a0-4c63-9e6a-548c159be3aa	https://app.midtrans.com/snap/v4/redirection/1c1baff4-89a0-4c63-9e6a-548c159be3aa	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 04:21:36.806	2025-09-29 04:21:36.806
1090	RYLS1197YTFIDIG	8dc3974d-a23d-4e00-8618-71d81737630e	https://app.midtrans.com/snap/v4/redirection/8dc3974d-a23d-4e00-8618-71d81737630e	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 04:49:58.043	2025-09-29 04:49:58.043
1091	RYLS1198YVBDDWAV	7a9847f4-0160-491f-adc3-466ae188b48c	https://app.midtrans.com/snap/v4/redirection/7a9847f4-0160-491f-adc3-466ae188b48c	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 05:24:17.311	2025-09-29 05:24:17.311
1092	RYLS1200DTRJGO	f648f1c9-4373-40eb-a737-6801b42902e5	https://app.midtrans.com/snap/v4/redirection/f648f1c9-4373-40eb-a737-6801b42902e5	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 05:35:31.841	2025-09-29 05:35:31.841
1093	RYLS1201ZZSFPJO	34fac38c-840e-4c8a-9054-6f422270865a	https://app.midtrans.com/snap/v4/redirection/34fac38c-840e-4c8a-9054-6f422270865a	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 05:38:25.539	2025-09-29 05:38:25.539
1094	RYLS1202UQLU	70626149-dee3-4473-b280-f7fa24d6a0c3	https://app.midtrans.com/snap/v4/redirection/70626149-dee3-4473-b280-f7fa24d6a0c3	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 05:41:26.123	2025-09-29 05:41:26.123
1095	RYLS1203KPURI	124ebd5c-9a91-4141-b100-112f63e34eea	https://app.midtrans.com/snap/v4/redirection/124ebd5c-9a91-4141-b100-112f63e34eea	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 05:42:56.557	2025-09-29 05:42:56.557
1096	RYLS1204VLSIIJH	9b158d6c-01dd-4462-a98b-c0345aaed339	https://app.midtrans.com/snap/v4/redirection/9b158d6c-01dd-4462-a98b-c0345aaed339	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 06:17:10.325	2025-09-29 06:17:10.325
1097	RYLS1205KOCWK	0798d94a-f28e-4401-bdfc-1c414c3beab7	https://app.midtrans.com/snap/v4/redirection/0798d94a-f28e-4401-bdfc-1c414c3beab7	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 06:20:58.214	2025-09-29 06:20:58.214
1098	RYLS1206RVNVZU	1cb6c19b-99ab-4b99-b726-1a7c63c080be	https://app.midtrans.com/snap/v4/redirection/1cb6c19b-99ab-4b99-b726-1a7c63c080be	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 06:48:03.993	2025-09-29 06:48:03.993
1099	RYLS1207PQTKRC	7f87780d-3d9a-4dfd-98d5-258e033a3497	https://app.midtrans.com/snap/v4/redirection/7f87780d-3d9a-4dfd-98d5-258e033a3497	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 07:24:59.486	2025-09-29 07:24:59.486
1100	RYLS1208SLVCIT	3ff9ba37-7047-450e-88a3-a10a305e854b	https://app.midtrans.com/snap/v4/redirection/3ff9ba37-7047-450e-88a3-a10a305e854b	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 07:41:02.472	2025-09-29 07:41:02.472
1101	RYLS1209WXJWS	d72b9ed1-0559-40de-9c73-b5ddb7f89ef8	https://app.midtrans.com/snap/v4/redirection/d72b9ed1-0559-40de-9c73-b5ddb7f89ef8	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 07:49:05.307	2025-09-29 07:49:05.307
1102	RYLS1210PMDHMU	17090988-bfea-4e6b-827e-148065ec5e3c	https://app.midtrans.com/snap/v4/redirection/17090988-bfea-4e6b-827e-148065ec5e3c	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 08:45:50.884	2025-09-29 08:45:50.884
1103	RYLS1211ZXZSI	a9687f65-5af9-49da-8be5-451c775ef771	https://app.midtrans.com/snap/v4/redirection/a9687f65-5af9-49da-8be5-451c775ef771	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 09:29:45.628	2025-09-29 09:29:45.628
1104	RYLS1212XLTOAX	a22b0a4f-8f0b-4c78-a311-9699a50f72fe	https://app.midtrans.com/snap/v4/redirection/a22b0a4f-8f0b-4c78-a311-9699a50f72fe	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 09:31:37.793	2025-09-29 09:31:37.793
1105	RYLS1213ZJPIVQT	8cda2adb-76cf-4fb9-9dee-cfbef227ea56	https://app.midtrans.com/snap/v4/redirection/8cda2adb-76cf-4fb9-9dee-cfbef227ea56	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 09:32:12.26	2025-09-29 09:32:12.26
1106	RYLS1214XISEPOT	036557da-02a4-43b4-a3ed-1c87d7bc2698	https://app.midtrans.com/snap/v4/redirection/036557da-02a4-43b4-a3ed-1c87d7bc2698	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 09:37:38.458	2025-09-29 09:37:38.458
1107	RYLS1215EWRKLVE	3b9cd25f-7a7f-4492-bc91-6d21d11d201f	https://app.midtrans.com/snap/v4/redirection/3b9cd25f-7a7f-4492-bc91-6d21d11d201f	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 09:46:35.136	2025-09-29 09:46:35.136
1108	RYLS1216JQAMIX	29ccebd5-b751-4f90-9ea8-9dabbb6dcfe2	https://app.midtrans.com/snap/v4/redirection/29ccebd5-b751-4f90-9ea8-9dabbb6dcfe2	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 09:55:45.721	2025-09-29 09:55:45.721
1109	RYLS1217MVHB	9c2faaf1-55e0-4d27-b38f-756fe22cc833	https://app.midtrans.com/snap/v4/redirection/9c2faaf1-55e0-4d27-b38f-756fe22cc833	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 10:06:55.339	2025-09-29 10:06:55.339
1110	RYLS1219BXAEL	0fbb65ec-d609-4780-97de-af23dfc3e811	https://app.midtrans.com/snap/v4/redirection/0fbb65ec-d609-4780-97de-af23dfc3e811	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 10:20:27.778	2025-09-29 10:20:27.778
1111	RYLS1220COKFBDC	24488dee-b316-4465-8efb-ca3aeea45390	https://app.midtrans.com/snap/v4/redirection/24488dee-b316-4465-8efb-ca3aeea45390	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 10:27:10.012	2025-09-29 10:27:10.012
1112	RYLS1221MLMEJ	2b53a406-dec1-45fa-a765-9325872847f3	https://app.midtrans.com/snap/v4/redirection/2b53a406-dec1-45fa-a765-9325872847f3	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 10:44:26.436	2025-09-29 10:44:26.436
1113	RYLS1222EJBSAW	79726181-1286-4908-b220-f0ef2d8feef3	https://app.midtrans.com/snap/v4/redirection/79726181-1286-4908-b220-f0ef2d8feef3	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 10:47:35.34	2025-09-29 10:47:35.34
1114	RYLS1223CHWY	ce8e2119-ec11-49ef-a570-e8b98dc1ff9f	https://app.midtrans.com/snap/v4/redirection/ce8e2119-ec11-49ef-a570-e8b98dc1ff9f	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 11:00:43.086	2025-09-29 11:00:43.086
1115	RYLS1224GTHDTWA	6557a3fc-c403-48ca-9a9e-d44ce100e232	https://app.midtrans.com/snap/v4/redirection/6557a3fc-c403-48ca-9a9e-d44ce100e232	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 11:04:05.54	2025-09-29 11:04:05.54
1116	RYLS1225JUWMQ	77d86001-9a99-441e-bd38-c2b4bb2c44bd	https://app.midtrans.com/snap/v4/redirection/77d86001-9a99-441e-bd38-c2b4bb2c44bd	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 11:15:02.432	2025-09-29 11:15:02.432
1117	RYLS1226BGGNRTR	39859673-5c00-4a92-9a6b-70a45f595539	https://app.midtrans.com/snap/v4/redirection/39859673-5c00-4a92-9a6b-70a45f595539	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 11:20:38.942	2025-09-29 11:20:38.942
1118	RYLS1227RMOARX	2a8a0195-59b8-44cc-8d45-3bdfcb20e1c7	https://app.midtrans.com/snap/v4/redirection/2a8a0195-59b8-44cc-8d45-3bdfcb20e1c7	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 11:21:57.667	2025-09-29 11:21:57.667
1119	RYLS1229RAMXXPF	5e3d7283-3f3a-4b62-8fdb-a3fd95f531c8	https://app.midtrans.com/snap/v4/redirection/5e3d7283-3f3a-4b62-8fdb-a3fd95f531c8	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 11:41:06.925	2025-09-29 11:41:06.925
1120	RYLS1230VTUNHHA	06f72080-5fbe-430e-9ca6-20d6960c5710	https://app.midtrans.com/snap/v4/redirection/06f72080-5fbe-430e-9ca6-20d6960c5710	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 11:49:24.525	2025-09-29 11:49:24.525
1121	RYLS1231GAMGP	23209b89-fb70-4774-b40d-2357be3490a7	https://app.midtrans.com/snap/v4/redirection/23209b89-fb70-4774-b40d-2357be3490a7	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 11:51:18.323	2025-09-29 11:51:18.323
1122	RYLS1232SNTMSA	25cba48d-2f85-4654-92ca-c613bf4d808d	https://app.midtrans.com/snap/v4/redirection/25cba48d-2f85-4654-92ca-c613bf4d808d	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 11:52:35.836	2025-09-29 11:52:35.836
1123	RYLS1233GUWQPNO	ea5145ea-d484-4fc5-810c-135077db3e3a	https://app.midtrans.com/snap/v4/redirection/ea5145ea-d484-4fc5-810c-135077db3e3a	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 12:23:33.305	2025-09-29 12:23:33.305
1124	RYLS1234ASVFJ	776caeb1-cfed-4af3-9b2f-2c9fc87597f6	https://app.midtrans.com/snap/v4/redirection/776caeb1-cfed-4af3-9b2f-2c9fc87597f6	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 12:24:47.947	2025-09-29 12:24:47.947
1125	RYLS1235LUXWA	d5306134-d981-400c-8c73-2a54bcccca93	https://app.midtrans.com/snap/v4/redirection/d5306134-d981-400c-8c73-2a54bcccca93	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 12:40:09.757	2025-09-29 12:40:09.757
1126	RYLS1236CSAGER	e9b1e153-1d98-4ca4-8fef-7750a556e160	https://app.midtrans.com/snap/v4/redirection/e9b1e153-1d98-4ca4-8fef-7750a556e160	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 12:59:40.842	2025-09-29 12:59:40.842
1127	RYLS1237FFOURIPD	a3c4e190-8121-460f-9aca-5534ede70d04	https://app.midtrans.com/snap/v4/redirection/a3c4e190-8121-460f-9aca-5534ede70d04	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 13:29:07.76	2025-09-29 13:29:07.76
1128	RYLS1238BFVXBT	ebd6732c-b177-4476-91a8-dd8a336131ff	https://app.midtrans.com/snap/v4/redirection/ebd6732c-b177-4476-91a8-dd8a336131ff	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 13:30:39.346	2025-09-29 13:30:39.346
1129	RYLS1239VUKP	f38b5a77-cd7b-49e8-8812-3730694ee62c	https://app.midtrans.com/snap/v4/redirection/f38b5a77-cd7b-49e8-8812-3730694ee62c	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 13:56:10.296	2025-09-29 13:56:10.296
1130	RYLS1240IIYAKF	738e36ae-0157-4f7c-92d1-880d0dffba71	https://app.midtrans.com/snap/v4/redirection/738e36ae-0157-4f7c-92d1-880d0dffba71	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 13:57:29.13	2025-09-29 13:57:29.13
1131	RYLS1241LRKQUCF	474a738d-8310-477a-abe4-727ed14cfa31	https://app.midtrans.com/snap/v4/redirection/474a738d-8310-477a-abe4-727ed14cfa31	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 14:21:28.807	2025-09-29 14:21:28.807
1132	RYLS1242KHRJ	4ec10fa6-553b-48f2-85f3-acd7ee9183d5	https://app.midtrans.com/snap/v4/redirection/4ec10fa6-553b-48f2-85f3-acd7ee9183d5	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 14:22:14.216	2025-09-29 14:22:14.216
1133	RYLS1243UJZVW	112abcdd-d9f3-4ac7-a74c-a0bd75b5bfda	https://app.midtrans.com/snap/v4/redirection/112abcdd-d9f3-4ac7-a74c-a0bd75b5bfda	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 14:28:20.525	2025-09-29 14:28:20.525
1134	RYLS1244NSWWPLE	52957427-c38a-41e8-9c6a-138c6fc1be54	https://app.midtrans.com/snap/v4/redirection/52957427-c38a-41e8-9c6a-138c6fc1be54	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 14:36:34.386	2025-09-29 14:36:34.386
1135	RYLS1245SCNSTP	6ca53841-6300-4bf1-8a34-b743883864eb	https://app.midtrans.com/snap/v4/redirection/6ca53841-6300-4bf1-8a34-b743883864eb	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 14:57:12.597	2025-09-29 14:57:12.597
1136	RYLS1246MQDZEU	d140e6e3-a170-4443-a8ae-b9acda248ac4	https://app.midtrans.com/snap/v4/redirection/d140e6e3-a170-4443-a8ae-b9acda248ac4	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 15:02:29.856	2025-09-29 15:02:29.856
1137	RYLS1247ALIIGF	48f912af-843d-495e-bb63-d70a244d9703	https://app.midtrans.com/snap/v4/redirection/48f912af-843d-495e-bb63-d70a244d9703	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 15:17:10.904	2025-09-29 15:17:10.904
1138	RYLS1248ZZZNRPO	2c0f7658-d3d8-4d8f-ba56-19c62a61c453	https://app.midtrans.com/snap/v4/redirection/2c0f7658-d3d8-4d8f-ba56-19c62a61c453	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 15:21:05.65	2025-09-29 15:21:05.65
1139	RYLS1249WQBLHC	9adcd154-9f21-43dc-b4b7-2df2285deac7	https://app.midtrans.com/snap/v4/redirection/9adcd154-9f21-43dc-b4b7-2df2285deac7	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 15:22:20.702	2025-09-29 15:22:20.702
1140	RYLS1250RZLBRJL	b2305a8b-6b37-46f9-8a78-5e95d0f1e325	https://app.midtrans.com/snap/v4/redirection/b2305a8b-6b37-46f9-8a78-5e95d0f1e325	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 15:27:59.307	2025-09-29 15:27:59.307
1141	RYLS1251DJERGY	c1579c44-a600-4e73-9061-83eba4e11698	https://app.midtrans.com/snap/v4/redirection/c1579c44-a600-4e73-9061-83eba4e11698	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 15:32:21.996	2025-09-29 15:32:21.996
1142	RYLS1253ATDNHYEI	24315463-a8d1-414d-85d0-375268bcb126	https://app.midtrans.com/snap/v4/redirection/24315463-a8d1-414d-85d0-375268bcb126	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 15:48:52.377	2025-09-29 15:48:52.377
1143	RYLS1254NKGQTV	51cf0b03-bd8e-4d7e-8214-edfb4b943e97	https://app.midtrans.com/snap/v4/redirection/51cf0b03-bd8e-4d7e-8214-edfb4b943e97	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 15:53:43.236	2025-09-29 15:53:43.236
1144	RYLS1256LQQTYP	b3866234-d79b-461b-9b4f-7deabcf7306e	https://app.midtrans.com/snap/v4/redirection/b3866234-d79b-461b-9b4f-7deabcf7306e	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 16:22:23.979	2025-09-29 16:22:23.979
1145	RYLS1257ZNDWA	b6726a45-37e8-475e-bc4d-349920c81f3c	https://app.midtrans.com/snap/v4/redirection/b6726a45-37e8-475e-bc4d-349920c81f3c	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 16:24:14.157	2025-09-29 16:24:14.157
1146	RYLS1258ZDQIFO	fae1bf9c-2d74-4885-bdb0-25c8d4ef2441	https://app.midtrans.com/snap/v4/redirection/fae1bf9c-2d74-4885-bdb0-25c8d4ef2441	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 16:25:46.819	2025-09-29 16:25:46.819
1147	RYLS1259LZMIZQ	f3ffa692-8d4c-4d4a-85b2-79bae9cf4275	https://app.midtrans.com/snap/v4/redirection/f3ffa692-8d4c-4d4a-85b2-79bae9cf4275	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 16:26:35.808	2025-09-29 16:26:35.808
1148	RYLS1260GJIBYE	999e3cc8-e471-4145-8bef-2dfd4efccddd	https://app.midtrans.com/snap/v4/redirection/999e3cc8-e471-4145-8bef-2dfd4efccddd	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 16:48:21.755	2025-09-29 16:48:21.755
1149	RYLS1261CKJUEPU	d0c1eb96-1f82-413d-83d7-cac94b02ad7a	https://app.midtrans.com/snap/v4/redirection/d0c1eb96-1f82-413d-83d7-cac94b02ad7a	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 17:08:51.52	2025-09-29 17:08:51.52
1150	RYLS1262INMYTMJQ	3d276960-5d35-45ae-a443-755ccce38228	https://app.midtrans.com/snap/v4/redirection/3d276960-5d35-45ae-a443-755ccce38228	\N	\N	1675	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 17:58:57.246	2025-09-29 17:58:57.246
1151	RYLS1264FOQKEAY	9c3fded8-35ce-4feb-bf16-1dc39ebe5ea4	https://app.midtrans.com/snap/v4/redirection/9c3fded8-35ce-4feb-bf16-1dc39ebe5ea4	\N	\N	1675	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 18:10:56.065	2025-09-29 18:10:56.065
1152	RYLS1265PTMRYZH	2f62718e-76ea-4034-bc91-acd4f4395ee6	https://app.midtrans.com/snap/v4/redirection/2f62718e-76ea-4034-bc91-acd4f4395ee6	\N	\N	1675	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 19:41:46.457	2025-09-29 19:41:46.457
1153	RYLS1267YGYSJHD	3f1063f2-9388-4f0c-a1b4-49d2079a4fd7	https://app.midtrans.com/snap/v4/redirection/3f1063f2-9388-4f0c-a1b4-49d2079a4fd7	\N	\N	1675	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 19:59:20.347	2025-09-29 19:59:20.347
1154	RYLS1268KFZPLOE	34012075-8d7c-4780-a13f-0762e4d920df	https://app.midtrans.com/snap/v4/redirection/34012075-8d7c-4780-a13f-0762e4d920df	\N	\N	1675	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 20:14:51.366	2025-09-29 20:14:51.366
1155	RYLS1269XXIYKJ	19b3f536-7091-4063-8b9c-b341b450c42a	https://app.midtrans.com/snap/v4/redirection/19b3f536-7091-4063-8b9c-b341b450c42a	\N	\N	1675	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 20:16:44.107	2025-09-29 20:16:44.107
1156	RYLS1270TWEECMI	ea9528d7-ca62-47fc-ae0a-c87c7b92e443	https://app.midtrans.com/snap/v4/redirection/ea9528d7-ca62-47fc-ae0a-c87c7b92e443	\N	\N	1675	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 20:34:29.813	2025-09-29 20:34:29.813
1157	RYLS1271MSJBM	4c7e26ca-4c03-4799-a232-eb6261da1eb0	https://app.midtrans.com/snap/v4/redirection/4c7e26ca-4c03-4799-a232-eb6261da1eb0	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 21:32:43.915	2025-09-29 21:32:43.915
1158	RYLS1272ADIVKBU	8a4fdbe4-c8ac-43d6-8b6e-40eb5f33bc55	https://app.midtrans.com/snap/v4/redirection/8a4fdbe4-c8ac-43d6-8b6e-40eb5f33bc55	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 22:27:33.913	2025-09-29 22:27:33.913
1159	RYLS1273YOSQM	d64a346e-f164-4f48-8683-81a0e2398ea3	https://app.midtrans.com/snap/v4/redirection/d64a346e-f164-4f48-8683-81a0e2398ea3	\N	\N	251262	IDR	pending	\N	{}	{}	\N	\N	2025-09-29 22:29:35.616	2025-09-29 22:29:35.616
1160	RYLS1274AQSJYPWZ	dff727be-01cd-4566-a193-2187d196f022	https://app.midtrans.com/snap/v4/redirection/dff727be-01cd-4566-a193-2187d196f022	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 01:05:53.639	2025-09-30 01:05:53.639
1161	RYLS1275XVBSEC	b39fd7ba-03af-4e4d-b442-7dce7c6a441e	https://app.midtrans.com/snap/v4/redirection/b39fd7ba-03af-4e4d-b442-7dce7c6a441e	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 01:39:45.37	2025-09-30 01:39:45.37
1162	RYLS1276UNTPW	93c1ddbe-355e-4026-82f1-21e67f1209e4	https://app.midtrans.com/snap/v4/redirection/93c1ddbe-355e-4026-82f1-21e67f1209e4	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 01:46:51.485	2025-09-30 01:46:51.485
1163	RYLS1277FXHRV	cae86cf8-2a81-4361-bc82-cdd174135238	https://app.midtrans.com/snap/v4/redirection/cae86cf8-2a81-4361-bc82-cdd174135238	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 01:56:21.607	2025-09-30 01:56:21.607
1164	RYLS1280TZQWKUF	caf44003-4840-44e7-b424-847f51068f62	https://app.midtrans.com/snap/v4/redirection/caf44003-4840-44e7-b424-847f51068f62	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 02:01:02.677	2025-09-30 02:01:02.677
1165	RYLS1281NWXUHSFK	7cf0ab9a-57a6-4aed-b129-f2cabfd399de	https://app.midtrans.com/snap/v4/redirection/7cf0ab9a-57a6-4aed-b129-f2cabfd399de	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 02:01:27.273	2025-09-30 02:01:27.273
1166	RYLS1283BNKBY	cc5ac867-0680-4f9d-a1e9-3d45f0bcef8b	https://app.midtrans.com/snap/v4/redirection/cc5ac867-0680-4f9d-a1e9-3d45f0bcef8b	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 03:14:14.423	2025-09-30 03:14:14.423
1167	RYLS1284WCJB	14a66d6f-8584-4c1e-866c-571d12608481	https://app.midtrans.com/snap/v4/redirection/14a66d6f-8584-4c1e-866c-571d12608481	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 03:16:07.239	2025-09-30 03:16:07.239
1168	RYLS1285ATXIVF	5609f631-5803-4187-baa0-d9a3191ea170	https://app.midtrans.com/snap/v4/redirection/5609f631-5803-4187-baa0-d9a3191ea170	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 03:25:19.977	2025-09-30 03:25:19.977
1169	RYLS1286SUVSPU	81fbf8e2-bf07-4d10-8890-0310325a1fc9	https://app.midtrans.com/snap/v4/redirection/81fbf8e2-bf07-4d10-8890-0310325a1fc9	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 03:27:04.219	2025-09-30 03:27:04.219
1170	RYLS1287HFVGLA	84f4727b-50a9-44db-bc9c-8b2ee8aa38ce	https://app.midtrans.com/snap/v4/redirection/84f4727b-50a9-44db-bc9c-8b2ee8aa38ce	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 03:39:45.551	2025-09-30 03:39:45.551
1171	RYLS1288SHBAT	4cab1dc6-7d34-490d-9b43-4866529ecaf1	https://app.midtrans.com/snap/v4/redirection/4cab1dc6-7d34-490d-9b43-4866529ecaf1	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 03:40:56.948	2025-09-30 03:40:56.948
1172	RYLS1289OZQOCXHV	f5231c09-070b-4abe-aea9-916a25f5a6fc	https://app.midtrans.com/snap/v4/redirection/f5231c09-070b-4abe-aea9-916a25f5a6fc	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 03:54:19.921	2025-09-30 03:54:19.921
1173	RYLS1290MUWGK	a6303f60-6c72-49cc-919a-cb01ba8f2fba	https://app.midtrans.com/snap/v4/redirection/a6303f60-6c72-49cc-919a-cb01ba8f2fba	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 04:20:34.883	2025-09-30 04:20:34.883
1174	RYLS1291QVCO	b84a31bd-69d7-4ac3-91c2-4ab8a0024f3a	https://app.midtrans.com/snap/v4/redirection/b84a31bd-69d7-4ac3-91c2-4ab8a0024f3a	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 04:21:03.823	2025-09-30 04:21:03.823
1175	RYLS1292TIGXKL	5e7da187-77d6-48b2-aea3-0f7d2a069b68	https://app.midtrans.com/snap/v4/redirection/5e7da187-77d6-48b2-aea3-0f7d2a069b68	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 04:31:58.197	2025-09-30 04:31:58.197
1176	RYLS1293DRTUF	77d3fcf5-ddfa-447c-b87c-9276797e33fb	https://app.midtrans.com/snap/v4/redirection/77d3fcf5-ddfa-447c-b87c-9276797e33fb	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 04:43:41.589	2025-09-30 04:43:41.589
1177	RYLS1294WQOZ	9f2d1dc1-4c7f-4b69-be75-b584346283df	https://app.midtrans.com/snap/v4/redirection/9f2d1dc1-4c7f-4b69-be75-b584346283df	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 04:45:08.454	2025-09-30 04:45:08.454
1178	RYLS1295QTJALT	74e606ab-19d0-4965-8487-8d572bceb31e	https://app.midtrans.com/snap/v4/redirection/74e606ab-19d0-4965-8487-8d572bceb31e	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 04:47:55.788	2025-09-30 04:47:55.788
1179	RYLS1296FXUZ	91d6561e-f8c8-4873-b09e-07b4ee26f507	https://app.midtrans.com/snap/v4/redirection/91d6561e-f8c8-4873-b09e-07b4ee26f507	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 04:57:40.788	2025-09-30 04:57:40.788
1180	RYLS1297NHYUSM	23cd46aa-3fcd-4c00-ae90-2fa1488ad973	https://app.midtrans.com/snap/v4/redirection/23cd46aa-3fcd-4c00-ae90-2fa1488ad973	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 05:00:29.911	2025-09-30 05:00:29.911
1181	RYLS1298UNHCY	911f0663-358c-49a6-ad5c-baf161d4a6b3	https://app.midtrans.com/snap/v4/redirection/911f0663-358c-49a6-ad5c-baf161d4a6b3	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 05:01:46.305	2025-09-30 05:01:46.305
1182	RYLS1299ZURGFZ	f8e05dc4-b52d-491b-b6be-6e8f9f524a03	https://app.midtrans.com/snap/v4/redirection/f8e05dc4-b52d-491b-b6be-6e8f9f524a03	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 05:03:57.568	2025-09-30 05:03:57.568
1183	RYLS1300GNRYCD	c1cec3bb-0261-4ef1-b1ae-e69eae9c3883	https://app.midtrans.com/snap/v4/redirection/c1cec3bb-0261-4ef1-b1ae-e69eae9c3883	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 05:08:04.098	2025-09-30 05:08:04.098
1184	RYLS1301QYHIFOM	8a3918c2-9bf6-438d-92b5-883092e56ca5	https://app.midtrans.com/snap/v4/redirection/8a3918c2-9bf6-438d-92b5-883092e56ca5	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 05:10:23.768	2025-09-30 05:10:23.768
1185	RYLS1302CVPRFB	07219407-e755-4809-b8d4-e6c7c2d0a5e1	https://app.midtrans.com/snap/v4/redirection/07219407-e755-4809-b8d4-e6c7c2d0a5e1	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 05:23:10.535	2025-09-30 05:23:10.535
1186	RYLS1303BWOLR	6d4364c4-007b-435f-8c99-79da61257d0d	https://app.midtrans.com/snap/v4/redirection/6d4364c4-007b-435f-8c99-79da61257d0d	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 05:46:50.399	2025-09-30 05:46:50.399
1187	RYLS1304LLCSG	4a784384-f88d-4494-9648-23b5286c48e3	https://app.midtrans.com/snap/v4/redirection/4a784384-f88d-4494-9648-23b5286c48e3	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 05:51:46.093	2025-09-30 05:51:46.093
1188	RYLS1305AIRRH	b0cd3623-e9bd-467f-bed0-e4406eae3658	https://app.midtrans.com/snap/v4/redirection/b0cd3623-e9bd-467f-bed0-e4406eae3658	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 05:56:37.778	2025-09-30 05:56:37.778
1189	RYLS1307XHYA	3841be6e-3cb7-4985-a46b-b3191e0dcebc	https://app.midtrans.com/snap/v4/redirection/3841be6e-3cb7-4985-a46b-b3191e0dcebc	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 06:08:04.192	2025-09-30 06:08:04.192
1190	RYLS1308THNBD	a51709c7-c2e8-4a43-a54e-26e0a64e1809	https://app.midtrans.com/snap/v4/redirection/a51709c7-c2e8-4a43-a54e-26e0a64e1809	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 06:27:13.953	2025-09-30 06:27:13.953
1191	RYLS1309OJTE	53f271a6-0cba-410d-b160-bae7531d190d	https://app.midtrans.com/snap/v4/redirection/53f271a6-0cba-410d-b160-bae7531d190d	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 06:47:56.259	2025-09-30 06:47:56.259
1192	RYLS1310JAMW	ed8ada63-d4b6-4b5e-8cc7-716227ea7a68	https://app.midtrans.com/snap/v4/redirection/ed8ada63-d4b6-4b5e-8cc7-716227ea7a68	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 07:03:12.715	2025-09-30 07:03:12.715
1193	RYLS1311UGOTJPB	ed5f828b-ac03-4dff-8488-e3f6ab3c8305	https://app.midtrans.com/snap/v4/redirection/ed5f828b-ac03-4dff-8488-e3f6ab3c8305	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 07:20:19.598	2025-09-30 07:20:19.598
1194	RYLS1312KGXVTN	beff9494-f27a-47d9-80e8-72d3c240cddd	https://app.midtrans.com/snap/v4/redirection/beff9494-f27a-47d9-80e8-72d3c240cddd	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 07:32:37.135	2025-09-30 07:32:37.135
1195	RYLS1314JGHFB	d9e46888-e18f-403e-af62-4bf70eb88010	https://app.midtrans.com/snap/v4/redirection/d9e46888-e18f-403e-af62-4bf70eb88010	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 08:07:14.228	2025-09-30 08:07:14.228
1196	RYLS1315WJHLQVJ	441163ce-5749-4a35-8ad1-245fccb765fc	https://app.midtrans.com/snap/v4/redirection/441163ce-5749-4a35-8ad1-245fccb765fc	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 08:10:43.445	2025-09-30 08:10:43.445
1197	RYLS1316XGOZIPB	e12c190a-2078-4b98-a925-e8a619f36384	https://app.midtrans.com/snap/v4/redirection/e12c190a-2078-4b98-a925-e8a619f36384	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 08:11:49.312	2025-09-30 08:11:49.312
1198	RYLS1317HYAQHI	15343984-84f9-4778-971b-255f6dd00f1d	https://app.midtrans.com/snap/v4/redirection/15343984-84f9-4778-971b-255f6dd00f1d	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 08:19:30.736	2025-09-30 08:19:30.736
1199	RYLS1318XIBTC	d7d8e207-56c1-4cdf-8d34-a763ecb57aaf	https://app.midtrans.com/snap/v4/redirection/d7d8e207-56c1-4cdf-8d34-a763ecb57aaf	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 08:26:21.41	2025-09-30 08:26:21.41
1200	RYLS1319AHJFL	f71972b8-eebb-4469-9b34-e790bf702164	https://app.midtrans.com/snap/v4/redirection/f71972b8-eebb-4469-9b34-e790bf702164	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 08:30:58.68	2025-09-30 08:30:58.68
1201	RYLS1321ICVJ	59faa3dd-a367-4cff-95cf-b66a6c4c4f13	https://app.midtrans.com/snap/v4/redirection/59faa3dd-a367-4cff-95cf-b66a6c4c4f13	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 08:52:57.867	2025-09-30 08:52:57.867
1202	RYLS1322IYOYTW	39ed757f-3587-48a3-9aac-fdc4e684cb8c	https://app.midtrans.com/snap/v4/redirection/39ed757f-3587-48a3-9aac-fdc4e684cb8c	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 09:26:50.46	2025-09-30 09:26:50.46
1203	RYLS1323ROFOECJ	09327788-384e-47b7-9665-3227c365381a	https://app.midtrans.com/snap/v4/redirection/09327788-384e-47b7-9665-3227c365381a	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 09:32:08.01	2025-09-30 09:32:08.01
1204	RYLS1326NUHTTPH	a29e7614-8ffb-43de-a36d-e6b713e45b56	https://app.midtrans.com/snap/v4/redirection/a29e7614-8ffb-43de-a36d-e6b713e45b56	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 09:37:55.922	2025-09-30 09:37:55.922
1205	RYLS1327LTZLDTC	f7035d9b-7107-4674-9529-50b7f643c4f2	https://app.midtrans.com/snap/v4/redirection/f7035d9b-7107-4674-9529-50b7f643c4f2	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 09:50:25.309	2025-09-30 09:50:25.309
1206	RYLS1328GCBCSS	62f0f8ff-13ba-48af-861e-e93e9bcac2a0	https://app.midtrans.com/snap/v4/redirection/62f0f8ff-13ba-48af-861e-e93e9bcac2a0	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 09:51:33.377	2025-09-30 09:51:33.377
1207	RYLS1330AUAVER	c0d268c6-7b1c-4d3f-af36-878428f3cbd2	https://app.midtrans.com/snap/v4/redirection/c0d268c6-7b1c-4d3f-af36-878428f3cbd2	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 09:57:46.921	2025-09-30 09:57:46.921
1208	RYLS1331EQFJC	71f17c75-8893-45b1-a53a-0ae1f308a326	https://app.midtrans.com/snap/v4/redirection/71f17c75-8893-45b1-a53a-0ae1f308a326	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 10:01:38.481	2025-09-30 10:01:38.481
1209	RYLS1332FMONNVT	6cc93c31-8115-4b36-84e5-12e86fc95d92	https://app.midtrans.com/snap/v4/redirection/6cc93c31-8115-4b36-84e5-12e86fc95d92	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 10:13:18.842	2025-09-30 10:13:18.842
1210	RYLS1333BISMVE	421e73a6-89f3-47f8-8bfb-8534f2ffd537	https://app.midtrans.com/snap/v4/redirection/421e73a6-89f3-47f8-8bfb-8534f2ffd537	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 10:18:15.522	2025-09-30 10:18:15.522
1211	RYLS1334ZICGP	6e9d50a8-4395-4141-afb1-e62b7ec5a3ef	https://app.midtrans.com/snap/v4/redirection/6e9d50a8-4395-4141-afb1-e62b7ec5a3ef	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 10:18:20.335	2025-09-30 10:18:20.335
1212	RYLS1335PMA	ae70dd1f-3baf-4961-b60d-37e468da71be	https://app.midtrans.com/snap/v4/redirection/ae70dd1f-3baf-4961-b60d-37e468da71be	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 10:18:59.533	2025-09-30 10:18:59.533
1213	RYLS1336UPUW	94fdacc9-57b6-4f5f-a2a2-44ab172fedde	https://app.midtrans.com/snap/v4/redirection/94fdacc9-57b6-4f5f-a2a2-44ab172fedde	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 10:27:32.794	2025-09-30 10:27:32.794
1214	RYLS1337FSGCPOF	64775d85-b157-4782-bcab-2e4ebfaea180	https://app.midtrans.com/snap/v4/redirection/64775d85-b157-4782-bcab-2e4ebfaea180	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 10:32:18.128	2025-09-30 10:32:18.128
1215	RYLS1338VHLKY	3b342f6e-1f05-46e2-bc29-0758612ae104	https://app.midtrans.com/snap/v4/redirection/3b342f6e-1f05-46e2-bc29-0758612ae104	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 10:44:46.287	2025-09-30 10:44:46.287
1216	RYLS1339XVZEKM	28d6c639-d796-4e4d-b15b-8940ae47960a	https://app.midtrans.com/snap/v4/redirection/28d6c639-d796-4e4d-b15b-8940ae47960a	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 10:55:45.447	2025-09-30 10:55:45.447
1217	RYLS1340TEBIBKN	25f931bb-b992-487b-963f-8223f086676b	https://app.midtrans.com/snap/v4/redirection/25f931bb-b992-487b-963f-8223f086676b	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 10:59:48.009	2025-09-30 10:59:48.009
1218	RYLS1341JUDWRG	4e263588-b12e-4082-b204-d5176ac30eab	https://app.midtrans.com/snap/v4/redirection/4e263588-b12e-4082-b204-d5176ac30eab	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 11:31:16.006	2025-09-30 11:31:16.006
1219	RYLS1342QSAHJ	ec63f7b8-1321-4c22-9608-1fd5e58aa72b	https://app.midtrans.com/snap/v4/redirection/ec63f7b8-1321-4c22-9608-1fd5e58aa72b	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 11:36:01.68	2025-09-30 11:36:01.68
1220	RYLS1343YRRCARD	ff03337b-87a6-4c63-85ac-cf2a0e399b16	https://app.midtrans.com/snap/v4/redirection/ff03337b-87a6-4c63-85ac-cf2a0e399b16	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 11:38:48.852	2025-09-30 11:38:48.852
1221	RYLS1344STGIM	1432d347-a189-430e-836c-4885626de078	https://app.midtrans.com/snap/v4/redirection/1432d347-a189-430e-836c-4885626de078	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 11:50:50.561	2025-09-30 11:50:50.561
1222	RYLS1346CJANGO	db6ea0d7-2030-44d0-b906-269ff6921040	https://app.midtrans.com/snap/v4/redirection/db6ea0d7-2030-44d0-b906-269ff6921040	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 12:36:33.647	2025-09-30 12:36:33.647
1223	RYLS1347CZBQ	4a175e24-21fd-4e3f-a2ef-b64fbf05259d	https://app.midtrans.com/snap/v4/redirection/4a175e24-21fd-4e3f-a2ef-b64fbf05259d	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 12:37:10.679	2025-09-30 12:37:10.679
1224	RYLS1348RRLHIRT	2aa58782-b167-4efe-9ffd-5e4c46439cf7	https://app.midtrans.com/snap/v4/redirection/2aa58782-b167-4efe-9ffd-5e4c46439cf7	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 12:37:39.56	2025-09-30 12:37:39.56
1225	RYLS1349MPUBNSIO	e9d87dca-06e2-4cec-a5b7-56ee12faf5c5	https://app.midtrans.com/snap/v4/redirection/e9d87dca-06e2-4cec-a5b7-56ee12faf5c5	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 12:38:17.553	2025-09-30 12:38:17.553
1226	RYLS1350QBVIN	79ba2b77-33a2-4508-b5c0-f45a27d26006	https://app.midtrans.com/snap/v4/redirection/79ba2b77-33a2-4508-b5c0-f45a27d26006	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 12:39:52.475	2025-09-30 12:39:52.475
1227	RYLS1353GQIXT	b2cf29c0-c704-4cb2-ba0d-e45701e4d01b	https://app.midtrans.com/snap/v4/redirection/b2cf29c0-c704-4cb2-ba0d-e45701e4d01b	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 12:44:30.803	2025-09-30 12:44:30.803
1228	RYLS1355AIZNBBB	5414317b-952e-4b95-b722-a082e11f2ba3	https://app.midtrans.com/snap/v4/redirection/5414317b-952e-4b95-b722-a082e11f2ba3	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 12:50:21.208	2025-09-30 12:50:21.208
1229	RYLS1356YYPZ	6de17f4f-3f5f-493b-9bfa-5423aa0d0d38	https://app.midtrans.com/snap/v4/redirection/6de17f4f-3f5f-493b-9bfa-5423aa0d0d38	\N	\N	12492000	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 12:56:35.934	2025-09-30 12:56:35.934
1230	RYLS1357JXBHLIP	6f8739ef-ab34-4f47-b973-e1071eb7a39d	https://app.midtrans.com/snap/v4/redirection/6f8739ef-ab34-4f47-b973-e1071eb7a39d	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 13:08:43.885	2025-09-30 13:08:43.885
1231	RYLS1359TDQBL	3f31abd9-ba0e-426b-930b-7f7039c91d72	https://app.midtrans.com/snap/v4/redirection/3f31abd9-ba0e-426b-930b-7f7039c91d72	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 13:29:29.261	2025-09-30 13:29:29.261
1232	RYLS1360VEPEHDQ	334f2093-a9a8-4b74-8e5c-e9c82099250d	https://app.midtrans.com/snap/v4/redirection/334f2093-a9a8-4b74-8e5c-e9c82099250d	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 13:33:13.937	2025-09-30 13:33:13.937
1233	RYLS1361TTYP	1e960e0c-be26-4297-b97e-cadf700fabfa	https://app.midtrans.com/snap/v4/redirection/1e960e0c-be26-4297-b97e-cadf700fabfa	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 13:42:34.58	2025-09-30 13:42:34.58
1234	RYLS1363LADVGBJ	a996b2f4-cc6e-43d1-bcd4-3bab37e30995	https://app.midtrans.com/snap/v4/redirection/a996b2f4-cc6e-43d1-bcd4-3bab37e30995	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 13:59:41.94	2025-09-30 13:59:41.94
1235	RYLS1364OOCOMTZ	671fd0dd-e0fe-483e-9d74-77ca121f2b95	https://app.midtrans.com/snap/v4/redirection/671fd0dd-e0fe-483e-9d74-77ca121f2b95	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 14:05:04.215	2025-09-30 14:05:04.215
1236	RYLS1365SHMDK	e3ae53eb-4890-4665-9e0c-61c4687f23a7	https://app.midtrans.com/snap/v4/redirection/e3ae53eb-4890-4665-9e0c-61c4687f23a7	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 14:14:26.369	2025-09-30 14:14:26.369
1237	RYLS1366YVFVDO	53c341e5-e926-44b5-aaca-55d499603f7f	https://app.midtrans.com/snap/v4/redirection/53c341e5-e926-44b5-aaca-55d499603f7f	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 14:23:31.715	2025-09-30 14:23:31.715
1238	RYLS1368QZLE	3bf07fe9-6b09-4d4b-a518-1c34158f1f20	https://app.midtrans.com/snap/v4/redirection/3bf07fe9-6b09-4d4b-a518-1c34158f1f20	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 14:31:25.219	2025-09-30 14:31:25.219
1239	RYLS1369OUCSB	6a62e422-1e63-4e66-88d3-406fda94a227	https://app.midtrans.com/snap/v4/redirection/6a62e422-1e63-4e66-88d3-406fda94a227	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 14:33:24.733	2025-09-30 14:33:24.733
1240	RYLS1370KEETD	24214111-daf6-4600-ba67-20002111134e	https://app.midtrans.com/snap/v4/redirection/24214111-daf6-4600-ba67-20002111134e	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 14:38:17.645	2025-09-30 14:38:17.645
1241	RYLS1372NIFH	d7982fa6-d1bc-4f35-b26f-b7ee602049bf	https://app.midtrans.com/snap/v4/redirection/d7982fa6-d1bc-4f35-b26f-b7ee602049bf	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 14:55:53.524	2025-09-30 14:55:53.524
1242	RYLS1373KK	41b262ed-48f4-4a73-bd7c-dee4c1dae2d9	https://app.midtrans.com/snap/v4/redirection/41b262ed-48f4-4a73-bd7c-dee4c1dae2d9	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 14:56:37.449	2025-09-30 14:56:37.449
1243	RYLS1375GETCB	e0e42ffc-c6af-4b50-9c78-1e7ad1df70ee	https://app.midtrans.com/snap/v4/redirection/e0e42ffc-c6af-4b50-9c78-1e7ad1df70ee	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 15:37:35.968	2025-09-30 15:37:35.968
1244	RYLS1377OJSCBGD	f8b02856-ab50-4b2e-b3a8-da6a70726fc9	https://app.midtrans.com/snap/v4/redirection/f8b02856-ab50-4b2e-b3a8-da6a70726fc9	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 15:41:20.401	2025-09-30 15:41:20.401
1245	RYLS1378QKNHLGY	9e41d3a3-219f-4026-85cd-5e17338ea5eb	https://app.midtrans.com/snap/v4/redirection/9e41d3a3-219f-4026-85cd-5e17338ea5eb	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 15:44:54.885	2025-09-30 15:44:54.885
1246	RYLS1379IAMGIA	7eb3a1eb-6a4b-45fe-b63d-8e795afe36d8	https://app.midtrans.com/snap/v4/redirection/7eb3a1eb-6a4b-45fe-b63d-8e795afe36d8	\N	\N	249840	IDR	pending	\N	{}	{}	\N	\N	2025-09-30 15:57:39.37	2025-09-30 15:57:39.37
1247	RYLS1380ZOIVSXD	ca2d75c2-c664-4dd2-8ad9-22f1072f6a03	https://app.sandbox.midtrans.com/snap/v4/redirection/ca2d75c2-c664-4dd2-8ad9-22f1072f6a03	\N	\N	1676	IDR	pending	\N	{}	{}	\N	\N	2026-02-27 19:28:46.091	2026-02-27 19:28:46.091
\.


--
-- Data for Name: programs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.programs (id, title, slug, image, description, status, created_at, updated_at) FROM stdin;
1	Rise Young Leaders Summit	rise-young-leaders-summit	/images/rise_young_leader.png	Rise Young Leaders Summit is an annual program to improve youth capacity for young people aged 16-25 in various topics. The program encourages youth through competitions for fully and partially funded Leadership Trip Programs in 6 lot of countries.	ACTIVE	2025-07-23 00:42:47.265	2025-07-23 00:42:47.265
2	Rise Sustainability Bootcamp	rise-sustainability-bootcamp	/images/rise_educator.png	Rise Educator's Skills Accelerator is an online learning program started from 1 up to 5 months live class with experts and mentor to student get comprehensive understanding in various sustainability topic. This program is for young professional, career switchers, sustainability and green workers to improve their knowledge and skills in this topic, equipped with JOB ACCELERATOR program with our hiring partners.	ACTIVE	2025-07-23 00:42:47.265	2025-07-23 00:42:47.265
3	Little Hero Camp	little-hero-camp	/images/rise_little_hero.png	Little Hero Camp is an offline summer training for children aged 7-15 years old. Equipped with various topics in sustainability, to enhance their skills and interests and become more empowered during their summer vacation.	ACTIVE	2025-07-23 00:42:47.265	2025-07-23 00:42:47.265
\.


--
-- Data for Name: ryls_fully_funded_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ryls_fully_funded_submissions (id, registration_id, essay_topic, essay_file_id, essay_description, created_at) FROM stdin;
2	3	\N	\N	\N	2025-08-15 18:12:31.763
3	4	\N	\N	\N	2025-08-16 06:25:58.766
4	5	\N	\N	\N	2025-08-16 23:20:29.945
5	6	\N	\N	\N	2025-08-17 07:56:07.328
6	7	\N	\N	\N	2025-08-19 03:18:19.114
8	9	\N	\N	\N	2025-08-19 09:40:37.934
15	16	\N	\N	\N	2025-08-21 02:32:10.649
16	17	\N	\N	\N	2025-08-21 02:54:04.251
18	19	\N	\N	\N	2025-08-21 04:55:11.291
21	22	\N	\N	\N	2025-08-22 14:35:40.212
22	23	\N	\N	\N	2025-08-23 12:08:00.707
23	24	\N	\N	\N	2025-08-23 13:21:53.741
24	25	\N	\N	\N	2025-08-24 03:37:39.704
25	26	\N	\N	\N	2025-08-25 10:56:25.472
26	27	\N	\N	\N	2025-08-26 02:27:28.61
27	28	\N	\N	\N	2025-08-26 03:12:05.969
28	29	\N	\N	\N	2025-08-26 04:55:58.14
29	30	\N	\N	\N	2025-08-26 05:04:00.18
30	31	\N	\N	\N	2025-08-26 05:06:44.667
32	33	\N	\N	\N	2025-08-26 05:58:10.719
33	34	\N	\N	\N	2025-08-26 06:35:07.622
34	35	\N	\N	\N	2025-08-26 07:35:18.45
35	36	\N	\N	\N	2025-08-26 08:05:07.693
36	37	\N	\N	\N	2025-08-26 08:05:19.717
37	38	\N	\N	\N	2025-08-26 09:09:28.751
38	39	\N	\N	\N	2025-08-26 15:11:37.257
39	40	\N	\N	\N	2025-08-27 03:53:47.517
40	41	\N	\N	\N	2025-08-27 06:06:57.935
41	42	\N	\N	\N	2025-08-27 07:38:52.325
42	43	\N	\N	\N	2025-08-27 07:50:10.583
43	44	\N	\N	\N	2025-08-27 07:58:17.883
44	45	\N	\N	\N	2025-08-27 08:05:35.72
45	46	\N	\N	\N	2025-08-27 09:31:53.643
46	47	\N	\N	\N	2025-08-27 09:36:04.48
47	48	\N	\N	\N	2025-08-27 09:53:37.412
48	49	\N	\N	\N	2025-08-27 13:31:21.265
49	50	\N	\N	\N	2025-08-27 13:51:42.604
50	51	\N	\N	\N	2025-08-27 16:41:11.041
51	52	\N	\N	\N	2025-08-28 09:31:41.182
52	53	\N	\N	\N	2025-08-28 09:40:16.751
56	57	\N	\N	\N	2025-08-28 12:13:36.129
57	58	\N	\N	\N	2025-08-28 13:07:44.844
58	59	\N	\N	\N	2025-08-28 13:25:43.362
59	60	\N	\N	\N	2025-08-28 15:36:10.332
60	61	\N	\N	\N	2025-08-29 04:50:30.869
61	62	\N	\N	\N	2025-08-29 07:17:26.494
62	63	\N	\N	\N	2025-08-29 07:46:59.071
63	64	\N	\N	\N	2025-08-29 09:04:28.089
64	65	\N	\N	\N	2025-08-29 10:28:20.434
65	66	\N	\N	\N	2025-08-30 08:12:58.681
66	67	\N	\N	\N	2025-08-30 13:46:15.554
67	68	\N	\N	\N	2025-08-30 15:26:15.392
68	69	\N	\N	\N	2025-08-30 15:29:00.952
69	70	\N	\N	\N	2025-08-30 16:15:18.31
70	71	\N	\N	\N	2025-08-30 18:14:42.495
71	72	\N	\N	\N	2025-08-31 00:14:29.681
72	73	\N	\N	\N	2025-08-31 18:51:36.766
73	74	\N	\N	\N	2025-09-01 11:20:40.91
74	75	\N	\N	\N	2025-09-01 14:21:16.856
75	76	\N	\N	\N	2025-09-01 17:37:01.773
76	77	\N	\N	\N	2025-09-02 06:55:28.141
78	79	\N	\N	\N	2025-09-02 09:41:45.362
79	80	\N	\N	\N	2025-09-02 09:54:51.072
80	81	\N	\N	\N	2025-09-02 09:57:00.837
81	82	\N	\N	\N	2025-09-02 10:20:51.301
82	83	\N	\N	\N	2025-09-02 10:52:04.041
83	84	\N	\N	\N	2025-09-02 11:30:09.175
84	85	\N	\N	\N	2025-09-02 11:34:56.891
85	86	\N	\N	\N	2025-09-02 13:05:51.171
86	87	\N	\N	\N	2025-09-02 13:23:31.145
88	89	\N	\N	\N	2025-09-02 14:27:08.399
89	90	\N	\N	\N	2025-09-02 15:18:24.311
90	91	\N	\N	\N	2025-09-02 20:10:26.801
91	92	\N	\N	\N	2025-09-03 04:21:55.372
92	93	\N	\N	\N	2025-09-03 05:48:14.307
95	96	\N	\N	\N	2025-09-03 07:59:18.287
98	99	\N	\N	\N	2025-09-03 08:31:26.954
99	100	\N	\N	\N	2025-09-03 09:13:30.136
104	105	\N	\N	\N	2025-09-04 06:29:50.602
105	106	\N	\N	\N	2025-09-04 09:53:04.711
107	108	\N	\N	\N	2025-09-05 01:40:57.99
108	109	\N	\N	\N	2025-09-05 06:08:28.28
109	110	\N	\N	\N	2025-09-05 06:33:17.753
110	111	\N	\N	\N	2025-09-05 06:39:52.573
111	112	\N	\N	\N	2025-09-05 13:26:11.494
113	114	\N	\N	\N	2025-09-05 15:56:08.683
114	115	\N	\N	\N	2025-09-07 10:42:31.897
115	116	\N	\N	\N	2025-09-07 11:34:45.831
116	117	\N	\N	\N	2025-09-07 11:46:37.657
117	118	\N	\N	\N	2025-09-07 15:17:34.962
118	119	\N	\N	\N	2025-09-07 19:14:16.138
119	120	\N	\N	\N	2025-09-08 09:35:45.725
120	121	\N	\N	\N	2025-09-08 10:41:52.028
122	123	\N	\N	\N	2025-09-08 19:27:43.353
123	124	\N	\N	\N	2025-09-08 20:11:15.622
124	125	\N	\N	\N	2025-09-09 00:24:35.338
127	128	\N	\N	\N	2025-09-09 09:12:48.349
128	129	\N	\N	\N	2025-09-09 15:26:22.58
130	131	\N	\N	\N	2025-09-10 16:57:13.605
131	132	\N	\N	\N	2025-09-10 20:52:09.146
132	133	\N	\N	\N	2025-09-11 08:08:18.583
137	138	\N	\N	\N	2025-09-11 12:32:25.678
147	148	\N	\N	\N	2025-09-11 13:51:30.278
148	149	\N	\N	\N	2025-09-11 15:39:46.752
152	153	\N	\N	\N	2025-09-12 05:27:43.876
153	154	\N	\N	\N	2025-09-12 22:13:59.705
154	155	\N	\N	\N	2025-09-12 22:27:22.221
156	157	\N	\N	\N	2025-09-13 04:04:28.086
157	158	\N	\N	\N	2025-09-13 10:27:00.112
159	160	\N	\N	\N	2025-09-14 10:09:25.814
160	161	\N	\N	\N	2025-09-15 12:31:17.696
165	166	\N	\N	\N	2025-09-16 03:55:31.677
166	167	\N	\N	\N	2025-09-16 04:17:30.65
167	168	\N	\N	\N	2025-09-16 06:26:22.128
168	169	\N	\N	\N	2025-09-19 15:23:04.19
169	170	\N	\N	\N	2025-09-19 16:15:26.996
170	171	\N	\N	\N	2025-09-19 16:22:59.327
171	172	\N	\N	\N	2025-09-19 17:50:31.582
172	174	\N	\N	\N	2025-09-20 01:10:38.063
183	184	\N	\N	\N	2025-09-20 05:25:18.875
184	185	\N	\N	\N	2025-09-20 05:51:36.265
185	186	\N	\N	\N	2025-09-20 07:05:33.776
187	188	\N	\N	\N	2025-09-20 07:25:27.78
188	189	\N	\N	\N	2025-09-21 00:23:14.705
189	190	\N	\N	\N	2025-09-21 14:29:59.972
190	191	\N	\N	\N	2025-09-21 16:40:30.788
191	192	\N	\N	\N	2025-09-21 17:23:03.21
192	193	\N	\N	\N	2025-09-22 06:56:06.461
193	194	\N	\N	\N	2025-09-22 08:29:56.616
194	195	\N	\N	\N	2025-09-22 08:40:06.854
195	196	\N	\N	\N	2025-09-22 09:51:54.036
196	197	\N	\N	\N	2025-09-23 00:32:09.236
197	198	\N	\N	\N	2025-09-23 02:14:57.138
198	199	\N	\N	\N	2025-09-23 02:15:00.33
202	203	\N	\N	\N	2025-09-23 04:55:32.814
203	204	\N	\N	\N	2025-09-23 07:26:15.06
204	205	\N	\N	\N	2025-09-23 07:53:24.529
207	208	\N	\N	\N	2025-09-23 08:30:31.261
215	216	\N	\N	\N	2025-09-23 18:23:12.487
216	217	\N	\N	\N	2025-09-23 22:47:59.355
217	218	\N	\N	\N	2025-09-24 00:52:37.563
219	220	\N	\N	\N	2025-09-24 01:03:04.921
220	221	\N	\N	\N	2025-09-24 05:01:09.776
221	222	\N	\N	\N	2025-09-24 05:32:58.609
222	223	\N	\N	\N	2025-09-24 08:07:18.818
224	225	\N	\N	\N	2025-09-24 14:42:03.118
225	226	\N	\N	\N	2025-09-24 17:37:13.513
226	227	\N	\N	\N	2025-09-24 21:42:39.479
227	228	\N	\N	\N	2025-09-25 00:19:30.323
228	229	\N	\N	\N	2025-09-25 03:43:26.772
229	230	\N	\N	\N	2025-09-25 04:23:44.331
230	231	\N	\N	\N	2025-09-25 04:35:35.775
231	232	\N	\N	\N	2025-09-25 05:34:43.223
233	234	\N	\N	\N	2025-09-25 06:50:14.754
234	235	\N	\N	\N	2025-09-25 12:17:30.089
235	236	\N	\N	\N	2025-09-25 12:41:30.671
237	238	\N	\N	\N	2025-09-25 15:52:37.842
238	239	\N	\N	\N	2025-09-25 20:06:24.908
239	240	\N	\N	\N	2025-09-26 03:06:56.493
240	241	\N	\N	\N	2025-09-26 07:38:37.746
242	243	\N	\N	\N	2025-09-26 09:22:24.323
243	244	\N	\N	\N	2025-09-26 11:09:50.978
244	245	\N	\N	\N	2025-09-26 12:40:25.61
245	247	\N	\N	\N	2025-09-26 13:21:17.711
249	250	\N	\N	\N	2025-09-26 14:33:44.549
250	251	\N	\N	\N	2025-09-26 14:36:45.677
251	252	\N	\N	\N	2025-09-26 17:14:08.696
253	254	\N	\N	\N	2025-09-26 19:13:55.426
254	255	\N	\N	\N	2025-09-27 10:19:15.833
255	256	\N	\N	\N	2025-09-27 11:25:38.263
258	259	\N	\N	\N	2025-09-27 13:11:00.272
260	261	\N	\N	\N	2025-09-27 14:35:03.323
261	262	\N	\N	\N	2025-09-27 15:39:06.415
262	263	\N	\N	\N	2025-09-27 16:49:15.513
264	265	\N	\N	\N	2025-09-27 21:47:25.638
265	266	\N	\N	\N	2025-09-28 03:17:15.693
266	267	\N	\N	\N	2025-09-28 05:42:13.438
267	268	\N	\N	\N	2025-09-28 05:55:25.216
268	269	\N	\N	\N	2025-09-28 07:53:15.441
269	270	\N	\N	\N	2025-09-28 09:34:21.878
270	271	\N	\N	\N	2025-09-28 09:37:14.457
271	272	\N	\N	\N	2025-09-28 15:59:38.967
273	274	\N	\N	\N	2025-09-28 17:27:37.399
274	275	\N	\N	\N	2025-09-28 18:58:27.314
275	276	\N	\N	\N	2025-09-28 19:40:56.688
276	277	\N	\N	\N	2025-09-29 01:36:20.418
277	278	\N	\N	\N	2025-09-29 05:26:31.982
278	279	\N	\N	\N	2025-09-29 05:40:25.901
279	280	\N	\N	\N	2025-09-29 07:44:21.053
280	281	\N	\N	\N	2025-09-29 07:52:20.245
281	282	\N	\N	\N	2025-09-29 08:47:56.453
283	284	\N	\N	\N	2025-09-29 10:02:01.782
285	286	\N	\N	\N	2025-09-29 11:17:54.3
286	287	\N	\N	\N	2025-09-29 11:27:01.601
287	288	\N	\N	\N	2025-09-29 13:02:26.213
288	289	\N	\N	\N	2025-09-29 13:30:35.453
289	290	\N	\N	\N	2025-09-29 13:58:02.884
290	291	\N	\N	\N	2025-09-29 15:24:40.472
291	292	\N	\N	\N	2025-09-29 15:39:42.637
292	293	\N	\N	\N	2025-09-29 16:10:48.272
293	294	\N	\N	\N	2025-09-29 16:51:23.448
294	295	\N	\N	\N	2025-09-29 17:59:19.048
295	296	\N	\N	\N	2025-09-29 19:51:46.263
296	297	\N	\N	\N	2025-09-30 01:56:31.902
297	298	\N	\N	\N	2025-09-30 01:59:31.023
298	299	\N	\N	\N	2025-09-30 02:03:15.264
299	300	\N	\N	\N	2025-09-30 02:03:22.424
300	301	\N	\N	\N	2025-09-30 05:05:36.766
301	302	\N	\N	\N	2025-09-30 05:54:35.29
302	303	\N	\N	\N	2025-09-30 06:00:33.595
304	305	\N	\N	\N	2025-09-30 08:21:29.494
305	306	\N	\N	\N	2025-09-30 08:32:51.459
306	307	\N	\N	\N	2025-09-30 08:34:21.363
307	308	\N	\N	\N	2025-09-30 08:57:00.286
308	309	\N	\N	\N	2025-09-30 09:37:32.839
309	310	\N	\N	\N	2025-09-30 09:39:46.976
310	311	\N	\N	\N	2025-09-30 09:52:04.287
311	312	\N	\N	\N	2025-09-30 09:54:35.15
312	313	\N	\N	\N	2025-09-30 10:03:53.445
313	314	\N	\N	\N	2025-09-30 10:15:20.593
314	315	\N	\N	\N	2025-09-30 11:33:32.92
315	316	\N	\N	\N	2025-09-30 11:53:28.731
316	317	\N	\N	\N	2025-09-30 12:31:04.098
317	318	\N	\N	\N	2025-09-30 12:40:59.416
318	319	\N	\N	\N	2025-09-30 12:41:39.697
319	320	\N	\N	\N	2025-09-30 12:48:06.559
320	321	\N	\N	\N	2025-09-30 13:16:16.297
321	322	\N	\N	\N	2025-09-30 13:31:14.143
322	323	\N	\N	\N	2025-09-30 13:44:18.076
323	324	\N	\N	\N	2025-09-30 13:57:37.618
324	325	\N	\N	\N	2025-09-30 14:05:52.874
325	326	\N	\N	\N	2025-09-30 14:24:23.061
326	327	\N	\N	\N	2025-09-30 14:25:33.505
327	328	\N	\N	\N	2025-09-30 14:43:44.511
328	329	\N	\N	\N	2025-09-30 15:00:30.656
329	330	\N	\N	\N	2025-09-30 15:40:29.086
330	331	\N	\N	\N	2025-09-30 15:45:23.078
331	332	\N	\N	\N	2026-02-27 19:29:46.278
332	333	\N	\N	\N	2026-02-27 19:31:40.339
\.


--
-- Data for Name: ryls_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ryls_payments (id, registration_id, paid_at, created_at, updated_at, midtrans_id, payment_proof_id, amount, status, type) FROM stdin;
1232	\N	\N	2025-09-29 11:52:35.84	2025-09-29 11:52:35.84	1122	\N	251262	PENDING	MIDTRANS
1236	\N	\N	2025-09-29 12:59:40.855	2025-09-29 12:59:40.855	1126	\N	251262	PENDING	MIDTRANS
2	\N	\N	2025-08-13 01:50:25.923	2025-08-13 01:50:25.923	1	\N	243873	PENDING	MIDTRANS
3	\N	2025-08-13 01:53:18.503	2025-08-13 01:53:18.504	2025-08-13 01:53:18.504	\N	3	1626	PAID	PAYPAL
5	\N	\N	2025-08-13 03:02:01.599	2025-08-13 03:02:01.599	3	\N	243540	PENDING	MIDTRANS
6	\N	\N	2025-08-15 07:20:44.552	2025-08-15 07:20:44.552	4	\N	242498	PENDING	MIDTRANS
7	\N	\N	2025-08-15 13:13:55.127	2025-08-15 13:13:55.127	5	\N	242600	PENDING	MIDTRANS
8	\N	\N	2025-08-15 13:18:17.573	2025-08-15 13:18:17.573	6	\N	242608	PENDING	MIDTRANS
9	\N	\N	2025-08-15 13:47:13.771	2025-08-15 13:47:13.771	7	\N	242623	PENDING	MIDTRANS
10	\N	\N	2025-08-15 14:13:17.938	2025-08-15 14:13:17.938	8	\N	242515	PENDING	MIDTRANS
11	\N	\N	2025-08-15 14:18:17.142	2025-08-15 14:18:17.142	9	\N	242550	PENDING	MIDTRANS
12	\N	\N	2025-08-15 14:56:15.45	2025-08-15 14:56:15.45	10	\N	242709	PENDING	MIDTRANS
13	\N	\N	2025-08-15 15:00:14.232	2025-08-15 15:00:14.232	11	\N	242704	PENDING	MIDTRANS
14	\N	\N	2025-08-15 15:02:08.342	2025-08-15 15:02:08.342	12	\N	242708	PENDING	MIDTRANS
15	\N	\N	2025-08-15 15:14:51.198	2025-08-15 15:14:51.198	13	\N	242719	PENDING	MIDTRANS
16	\N	\N	2025-08-15 15:20:41.177	2025-08-15 15:20:41.177	14	\N	242711	PENDING	MIDTRANS
17	\N	\N	2025-08-15 15:32:54.531	2025-08-15 15:32:54.531	15	\N	242723	PENDING	MIDTRANS
18	\N	\N	2025-08-15 16:54:41.836	2025-08-15 16:54:41.836	16	\N	242803	PENDING	MIDTRANS
19	\N	\N	2025-08-15 17:03:30.459	2025-08-15 17:03:30.459	17	\N	242803	PENDING	MIDTRANS
20	\N	\N	2025-08-15 17:07:13.242	2025-08-15 17:07:13.242	18	\N	242803	PENDING	MIDTRANS
21	\N	\N	2025-08-15 17:52:19.843	2025-08-15 17:52:19.843	19	\N	242803	PENDING	MIDTRANS
22	\N	\N	2025-08-15 17:56:54.219	2025-08-15 17:56:54.219	20	\N	242803	PENDING	MIDTRANS
23	3	2025-08-15 18:12:30.159	2025-08-15 18:12:30.163	2025-08-15 18:12:31.726	\N	7	242803	PAID	PAYPAL
24	\N	\N	2025-08-15 22:05:59.598	2025-08-15 22:05:59.598	21	\N	242803	PENDING	MIDTRANS
25	\N	\N	2025-08-16 03:33:06.9	2025-08-16 03:33:06.9	22	\N	242803	PENDING	MIDTRANS
26	\N	\N	2025-08-16 06:05:30.502	2025-08-16 06:05:30.502	23	\N	242803	PENDING	MIDTRANS
27	\N	\N	2025-08-16 06:16:32.77	2025-08-16 06:16:32.77	24	\N	242803	PENDING	MIDTRANS
28	4	2025-08-16 06:25:56.365	2025-08-16 06:25:56.369	2025-08-16 06:25:58.736	\N	9	242803	PAID	PAYPAL
29	\N	\N	2025-08-16 08:47:17.037	2025-08-16 08:47:17.037	25	\N	242803	PENDING	MIDTRANS
30	\N	\N	2025-08-16 08:56:09.835	2025-08-16 08:56:09.835	26	\N	242803	PENDING	MIDTRANS
31	\N	\N	2025-08-16 09:08:28.032	2025-08-16 09:08:28.032	27	\N	242803	PENDING	MIDTRANS
32	\N	\N	2025-08-16 09:37:33.318	2025-08-16 09:37:33.318	28	\N	242803	PENDING	MIDTRANS
33	\N	\N	2025-08-16 12:35:06.242	2025-08-16 12:35:06.242	29	\N	242803	PENDING	MIDTRANS
34	\N	\N	2025-08-16 12:55:39.619	2025-08-16 12:55:39.619	30	\N	242803	PENDING	MIDTRANS
35	\N	\N	2025-08-16 13:17:06.949	2025-08-16 13:17:06.949	31	\N	242803	PENDING	MIDTRANS
36	\N	\N	2025-08-16 14:46:12.07	2025-08-16 14:46:12.07	32	\N	242803	PENDING	MIDTRANS
37	\N	\N	2025-08-16 15:10:54.478	2025-08-16 15:10:54.478	33	\N	242803	PENDING	MIDTRANS
38	\N	\N	2025-08-16 16:09:09.863	2025-08-16 16:09:09.863	34	\N	242803	PENDING	MIDTRANS
39	\N	\N	2025-08-16 16:38:22.671	2025-08-16 16:38:22.671	35	\N	242803	PENDING	MIDTRANS
40	\N	\N	2025-08-16 22:46:34.412	2025-08-16 22:46:34.412	36	\N	242803	PENDING	MIDTRANS
41	\N	\N	2025-08-16 22:54:52.029	2025-08-16 22:54:52.029	37	\N	242803	PENDING	MIDTRANS
42	\N	\N	2025-08-16 22:57:51.236	2025-08-16 22:57:51.236	38	\N	242803	PENDING	MIDTRANS
43	\N	\N	2025-08-16 22:58:20.098	2025-08-16 22:58:20.098	39	\N	242803	PENDING	MIDTRANS
44	\N	\N	2025-08-16 23:11:05.912	2025-08-16 23:11:05.912	40	\N	242803	PENDING	MIDTRANS
45	5	\N	2025-08-16 23:14:57.939	2025-08-16 23:20:29.923	41	\N	242803	PENDING	MIDTRANS
46	\N	\N	2025-08-17 03:09:37.674	2025-08-17 03:09:37.674	42	\N	242803	PENDING	MIDTRANS
47	\N	\N	2025-08-17 03:33:36.418	2025-08-17 03:33:36.418	43	\N	242803	PENDING	MIDTRANS
48	\N	\N	2025-08-17 06:26:37.817	2025-08-17 06:26:37.817	44	\N	242803	PENDING	MIDTRANS
49	\N	\N	2025-08-17 07:13:56.653	2025-08-17 07:13:56.653	45	\N	242803	PENDING	MIDTRANS
50	\N	\N	2025-08-17 07:17:21.022	2025-08-17 07:17:21.022	46	\N	242803	PENDING	MIDTRANS
51	\N	\N	2025-08-17 07:47:11.601	2025-08-17 07:47:11.601	47	\N	242803	PENDING	MIDTRANS
52	6	2025-08-17 07:56:05.131	2025-08-17 07:56:05.134	2025-08-17 07:56:07.317	\N	15	242803	PAID	PAYPAL
53	\N	\N	2025-08-17 08:05:34.499	2025-08-17 08:05:34.499	48	\N	242803	PENDING	MIDTRANS
54	\N	\N	2025-08-17 12:19:48.033	2025-08-17 12:19:48.033	49	\N	242803	PENDING	MIDTRANS
55	\N	\N	2025-08-17 13:40:35.938	2025-08-17 13:40:35.938	50	\N	242803	PENDING	MIDTRANS
56	\N	\N	2025-08-17 14:38:04.53	2025-08-17 14:38:04.53	51	\N	242803	PENDING	MIDTRANS
57	\N	\N	2025-08-17 14:38:19.468	2025-08-17 14:38:19.468	52	\N	242803	PENDING	MIDTRANS
58	\N	\N	2025-08-17 14:46:04.179	2025-08-17 14:46:04.179	53	\N	242803	PENDING	MIDTRANS
59	\N	\N	2025-08-17 14:48:41.026	2025-08-17 14:48:41.026	54	\N	242803	PENDING	MIDTRANS
60	\N	\N	2025-08-17 15:07:22.621	2025-08-17 15:07:22.621	55	\N	242803	PENDING	MIDTRANS
61	\N	\N	2025-08-17 16:27:56.102	2025-08-17 16:27:56.102	56	\N	242803	PENDING	MIDTRANS
62	\N	\N	2025-08-17 16:54:12.234	2025-08-17 16:54:12.234	57	\N	242803	PENDING	MIDTRANS
63	\N	\N	2025-08-17 17:01:27.144	2025-08-17 17:01:27.144	58	\N	242803	PENDING	MIDTRANS
64	\N	\N	2025-08-17 17:17:30.527	2025-08-17 17:17:30.527	59	\N	242803	PENDING	MIDTRANS
65	\N	\N	2025-08-17 17:44:25.05	2025-08-17 17:44:25.05	60	\N	242803	PENDING	MIDTRANS
66	\N	\N	2025-08-17 20:49:16.627	2025-08-17 20:49:16.627	61	\N	242803	PENDING	MIDTRANS
67	\N	\N	2025-08-17 22:09:10.558	2025-08-17 22:09:10.558	62	\N	242803	PENDING	MIDTRANS
68	\N	\N	2025-08-18 00:37:17.062	2025-08-18 00:37:17.062	63	\N	242803	PENDING	MIDTRANS
69	\N	\N	2025-08-18 02:56:09.031	2025-08-18 02:56:09.031	64	\N	242803	PENDING	MIDTRANS
70	\N	\N	2025-08-18 02:56:44.708	2025-08-18 02:56:44.708	65	\N	242803	PENDING	MIDTRANS
71	\N	\N	2025-08-18 03:35:36.485	2025-08-18 03:35:36.485	66	\N	242803	PENDING	MIDTRANS
72	\N	\N	2025-08-18 04:02:08.113	2025-08-18 04:02:08.113	67	\N	242803	PENDING	MIDTRANS
73	\N	\N	2025-08-18 05:08:05.061	2025-08-18 05:08:05.061	68	\N	242803	PENDING	MIDTRANS
74	\N	\N	2025-08-18 06:49:52.879	2025-08-18 06:49:52.879	69	\N	242803	PENDING	MIDTRANS
75	\N	\N	2025-08-18 07:01:45.811	2025-08-18 07:01:45.811	70	\N	242803	PENDING	MIDTRANS
76	\N	\N	2025-08-18 07:55:45.127	2025-08-18 07:55:45.127	71	\N	242803	PENDING	MIDTRANS
77	\N	\N	2025-08-18 08:59:59.791	2025-08-18 08:59:59.791	72	\N	242803	PENDING	MIDTRANS
78	\N	\N	2025-08-18 10:44:35.057	2025-08-18 10:44:35.057	73	\N	242803	PENDING	MIDTRANS
79	\N	\N	2025-08-18 10:50:02.811	2025-08-18 10:50:02.811	74	\N	242803	PENDING	MIDTRANS
80	\N	\N	2025-08-18 10:54:32.529	2025-08-18 10:54:32.529	75	\N	242803	PENDING	MIDTRANS
81	\N	\N	2025-08-18 11:27:41.567	2025-08-18 11:27:41.567	76	\N	242803	PENDING	MIDTRANS
82	\N	\N	2025-08-18 11:38:07.836	2025-08-18 11:38:07.836	77	\N	242803	PENDING	MIDTRANS
83	\N	\N	2025-08-18 11:45:24.669	2025-08-18 11:45:24.669	78	\N	242803	PENDING	MIDTRANS
84	\N	\N	2025-08-18 13:21:52.829	2025-08-18 13:21:52.829	79	\N	242803	PENDING	MIDTRANS
85	\N	\N	2025-08-18 13:49:31.169	2025-08-18 13:49:31.169	80	\N	242803	PENDING	MIDTRANS
86	\N	\N	2025-08-18 14:29:48.019	2025-08-18 14:29:48.019	81	\N	242803	PENDING	MIDTRANS
87	\N	\N	2025-08-18 14:54:50.812	2025-08-18 14:54:50.812	82	\N	242803	PENDING	MIDTRANS
88	\N	\N	2025-08-18 14:56:47.797	2025-08-18 14:56:47.797	83	\N	242803	PENDING	MIDTRANS
1	\N	2025-08-13 01:30:21.135	2025-08-13 01:30:21.136	2025-08-13 01:30:23.011	\N	2	12192901	PAID	PAYPAL
4	\N	\N	2025-08-13 01:53:19.807	2025-08-13 01:54:38.587	2	\N	1626	PENDING	MIDTRANS
89	\N	\N	2025-08-18 21:02:22.51	2025-08-18 21:02:22.51	84	\N	243274	PENDING	MIDTRANS
90	\N	\N	2025-08-18 23:34:48.095	2025-08-18 23:34:48.095	85	\N	243275	PENDING	MIDTRANS
91	\N	\N	2025-08-19 01:09:28.175	2025-08-19 01:09:28.175	86	\N	243317	PENDING	MIDTRANS
92	\N	\N	2025-08-19 01:11:03.496	2025-08-19 01:11:03.496	87	\N	243317	PENDING	MIDTRANS
93	\N	\N	2025-08-19 01:26:04.31	2025-08-19 01:26:04.31	88	\N	243343	PENDING	MIDTRANS
94	\N	\N	2025-08-19 01:33:59.363	2025-08-19 01:33:59.363	89	\N	243269	PENDING	MIDTRANS
95	\N	\N	2025-08-19 01:45:47.6	2025-08-19 01:45:47.6	90	\N	243411	PENDING	MIDTRANS
96	\N	\N	2025-08-19 01:47:59.389	2025-08-19 01:47:59.389	91	\N	243414	PENDING	MIDTRANS
97	\N	\N	2025-08-19 02:26:41.035	2025-08-19 02:26:41.035	92	\N	243675	PENDING	MIDTRANS
98	\N	\N	2025-08-19 02:52:04.48	2025-08-19 02:52:04.48	93	\N	243637	PENDING	MIDTRANS
99	\N	\N	2025-08-19 03:17:14.131	2025-08-19 03:17:14.131	94	\N	243494	PENDING	MIDTRANS
100	\N	\N	2025-08-19 03:17:33.842	2025-08-19 03:17:33.842	95	\N	243494	PENDING	MIDTRANS
101	7	2025-08-19 03:18:16.186	2025-08-19 03:18:16.189	2025-08-19 03:18:19.097	\N	21	243514	PAID	PAYPAL
102	\N	\N	2025-08-19 03:31:24.226	2025-08-19 03:31:24.226	96	\N	243406	PENDING	MIDTRANS
103	\N	\N	2025-08-19 03:47:51.312	2025-08-19 03:47:51.312	97	\N	243438	PENDING	MIDTRANS
104	\N	\N	2025-08-19 03:55:46.258	2025-08-19 03:55:46.258	98	\N	243417	PENDING	MIDTRANS
105	\N	\N	2025-08-19 04:13:18.766	2025-08-19 04:13:18.766	99	\N	243476	PENDING	MIDTRANS
106	\N	\N	2025-08-19 04:56:40.218	2025-08-19 04:56:40.218	100	\N	243529	PENDING	MIDTRANS
107	\N	\N	2025-08-19 06:04:42.858	2025-08-19 06:04:42.858	101	\N	243550	PENDING	MIDTRANS
108	\N	\N	2025-08-19 06:15:03.092	2025-08-19 06:15:03.092	102	\N	243531	PENDING	MIDTRANS
109	\N	\N	2025-08-19 07:03:52.133	2025-08-19 07:03:52.133	103	\N	243726	PENDING	MIDTRANS
110	\N	\N	2025-08-19 07:06:13.754	2025-08-19 07:06:13.754	104	\N	243740	PENDING	MIDTRANS
111	\N	\N	2025-08-19 07:09:08.402	2025-08-19 07:09:08.402	105	\N	243725	PENDING	MIDTRANS
112	\N	\N	2025-08-19 07:09:20.125	2025-08-19 07:09:20.125	106	\N	243725	PENDING	MIDTRANS
113	\N	\N	2025-08-19 07:12:32.13	2025-08-19 07:12:32.13	107	\N	243677	PENDING	MIDTRANS
114	\N	\N	2025-08-19 07:12:46.502	2025-08-19 07:12:46.502	108	\N	243677	PENDING	MIDTRANS
115	\N	\N	2025-08-19 07:14:24.339	2025-08-19 07:14:24.339	109	\N	243708	PENDING	MIDTRANS
116	\N	\N	2025-08-19 07:14:49.815	2025-08-19 07:14:49.815	110	\N	243708	PENDING	MIDTRANS
117	\N	\N	2025-08-19 07:19:51.53	2025-08-19 07:19:51.53	111	\N	243745	PENDING	MIDTRANS
118	\N	\N	2025-08-19 07:24:00.417	2025-08-19 07:24:00.417	112	\N	243737	PENDING	MIDTRANS
119	\N	\N	2025-08-19 07:24:40.708	2025-08-19 07:24:40.708	113	\N	243737	PENDING	MIDTRANS
120	\N	\N	2025-08-19 07:28:24.193	2025-08-19 07:28:24.193	114	\N	243735	PENDING	MIDTRANS
121	\N	\N	2025-08-19 07:31:11.977	2025-08-19 07:31:11.977	115	\N	243787	PENDING	MIDTRANS
122	\N	\N	2025-08-19 07:32:25.817	2025-08-19 07:32:25.817	116	\N	243778	PENDING	MIDTRANS
123	\N	\N	2025-08-19 07:33:43.333	2025-08-19 07:33:43.333	117	\N	243778	PENDING	MIDTRANS
124	\N	\N	2025-08-19 07:39:33.339	2025-08-19 07:39:33.339	118	\N	243716	PENDING	MIDTRANS
125	\N	\N	2025-08-19 07:44:27.969	2025-08-19 07:44:27.969	119	\N	243722	PENDING	MIDTRANS
126	\N	\N	2025-08-19 07:51:18.374	2025-08-19 07:51:18.374	120	\N	243718	PENDING	MIDTRANS
127	\N	\N	2025-08-19 08:05:23.257	2025-08-19 08:05:23.257	121	\N	243791	PENDING	MIDTRANS
128	\N	\N	2025-08-19 08:15:20.497	2025-08-19 08:15:20.497	122	\N	243905	PENDING	MIDTRANS
129	\N	\N	2025-08-19 08:32:50.348	2025-08-19 08:32:50.348	123	\N	243910	PENDING	MIDTRANS
130	\N	\N	2025-08-19 08:51:57.535	2025-08-19 08:51:57.535	124	\N	243945	PENDING	MIDTRANS
131	\N	\N	2025-08-19 09:07:25.198	2025-08-19 09:07:25.198	125	\N	243917	PENDING	MIDTRANS
159	\N	\N	2025-08-20 23:39:45.102	2025-08-20 23:39:45.102	147	\N	243411	PENDING	MIDTRANS
132	9	\N	2025-08-19 09:35:50.187	2025-08-19 09:40:37.925	126	\N	243968	PENDING	MIDTRANS
133	\N	\N	2025-08-19 10:06:48.814	2025-08-19 10:06:48.814	127	\N	243922	PENDING	MIDTRANS
134	\N	2025-08-19 10:23:42.622	2025-08-19 10:23:42.623	2025-08-19 10:23:42.623	\N	24	243872	PAID	PAYPAL
135	\N	\N	2025-08-19 10:23:43.862	2025-08-19 10:23:43.862	128	\N	243872	PENDING	MIDTRANS
136	\N	\N	2025-08-19 10:41:07.236	2025-08-19 10:41:07.236	129	\N	243884	PENDING	MIDTRANS
137	\N	\N	2025-08-19 10:42:39.97	2025-08-19 10:42:39.97	130	\N	243884	PENDING	MIDTRANS
138	\N	\N	2025-08-19 11:10:11.998	2025-08-19 11:10:11.998	131	\N	243883	PENDING	MIDTRANS
139	\N	\N	2025-08-19 11:22:14.678	2025-08-19 11:22:14.678	132	\N	243773	PENDING	MIDTRANS
140	\N	\N	2025-08-19 11:33:35.793	2025-08-19 11:33:35.793	133	\N	243770	PENDING	MIDTRANS
141	\N	\N	2025-08-19 11:35:06.367	2025-08-19 11:35:06.367	134	\N	243769	PENDING	MIDTRANS
142	\N	\N	2025-08-19 11:50:28.229	2025-08-19 11:50:28.229	135	\N	243801	PENDING	MIDTRANS
143	\N	\N	2025-08-19 11:54:28.228	2025-08-19 11:54:28.228	136	\N	243801	PENDING	MIDTRANS
144	\N	\N	2025-08-19 12:50:45.592	2025-08-19 12:50:45.592	137	\N	243885	PENDING	MIDTRANS
145	\N	\N	2025-08-19 13:05:23.962	2025-08-19 13:05:23.962	138	\N	243953	PENDING	MIDTRANS
161	\N	\N	2025-08-21 01:10:46.156	2025-08-21 01:10:46.156	148	\N	243501	PENDING	MIDTRANS
163	\N	\N	2025-08-21 02:23:50.866	2025-08-21 02:23:50.866	150	\N	243501	PENDING	MIDTRANS
162	16	\N	2025-08-21 02:21:25.415	2025-08-21 02:32:10.638	149	\N	243501	PENDING	MIDTRANS
150	\N	\N	2025-08-20 18:06:17.776	2025-08-20 18:06:17.776	139	\N	243411	PENDING	MIDTRANS
151	\N	\N	2025-08-20 18:10:04.722	2025-08-20 18:10:04.722	140	\N	243411	PENDING	MIDTRANS
152	\N	\N	2025-08-20 18:26:36.288	2025-08-20 18:26:36.288	141	\N	243411	PENDING	MIDTRANS
164	\N	\N	2025-08-21 02:52:49.166	2025-08-21 02:52:49.166	151	\N	243501	PENDING	MIDTRANS
154	\N	\N	2025-08-20 21:23:29.294	2025-08-20 21:23:29.294	142	\N	243411	PENDING	MIDTRANS
155	\N	\N	2025-08-20 21:26:52.437	2025-08-20 21:26:52.437	143	\N	243411	PENDING	MIDTRANS
156	\N	\N	2025-08-20 21:47:35.377	2025-08-20 21:47:35.377	144	\N	243411	PENDING	MIDTRANS
157	\N	\N	2025-08-20 23:27:04.69	2025-08-20 23:27:04.69	145	\N	243411	PENDING	MIDTRANS
158	\N	\N	2025-08-20 23:28:52.632	2025-08-20 23:28:52.632	146	\N	243411	PENDING	MIDTRANS
146	\N	2025-08-20 17:48:44.692	2025-08-20 17:48:44.693	2025-08-20 17:48:48.63	\N	54	243411	PAID	PAYPAL
147	\N	2025-08-20 17:51:22.446	2025-08-20 17:51:22.448	2025-08-20 17:51:33.679	\N	55	243411	PAID	PAYPAL
148	\N	2025-08-20 17:53:07.264	2025-08-20 17:53:07.265	2025-08-20 17:53:18.242	\N	56	243411	PAID	PAYPAL
149	\N	2025-08-20 17:54:44.236	2025-08-20 17:54:44.237	2025-08-20 17:54:45.055	\N	57	243411	PAID	PAYPAL
153	\N	2025-08-20 19:34:01.24	2025-08-20 19:34:01.243	2025-08-20 19:34:04.634	\N	59	243411	PAID	PAYPAL
160	\N	2025-08-21 00:44:27.713	2025-08-21 00:44:27.718	2025-08-21 00:44:40.25	\N	60	243501	PAID	PAYPAL
165	17	2025-08-21 02:54:01.873	2025-08-21 02:54:01.874	2025-08-21 02:54:04.242	\N	61	243501	PAID	PAYPAL
1233	\N	\N	2025-09-29 12:23:33.32	2025-09-29 12:23:33.32	1123	\N	251262	PENDING	MIDTRANS
167	\N	\N	2025-08-21 03:45:47.356	2025-08-21 03:45:47.356	152	\N	243501	PENDING	MIDTRANS
168	\N	\N	2025-08-21 03:52:06.962	2025-08-21 03:52:06.962	153	\N	243501	PENDING	MIDTRANS
169	\N	\N	2025-08-21 04:13:10.479	2025-08-21 04:13:10.479	154	\N	243501	PENDING	MIDTRANS
170	\N	\N	2025-08-21 04:24:12.334	2025-08-21 04:24:12.334	155	\N	243501	PENDING	MIDTRANS
171	\N	\N	2025-08-21 04:53:50.688	2025-08-21 04:53:50.688	156	\N	243501	PENDING	MIDTRANS
172	\N	2025-08-21 04:54:18.461	2025-08-21 04:54:18.469	2025-08-21 04:54:18.469	\N	63	243501	PAID	PAYPAL
173	19	2025-08-21 04:55:08.284	2025-08-21 04:55:08.285	2025-08-21 04:55:11.281	\N	64	243501	PAID	PAYPAL
174	\N	\N	2025-08-21 04:59:23.466	2025-08-21 04:59:23.466	157	\N	243501	PENDING	MIDTRANS
175	\N	\N	2025-08-21 05:07:56.068	2025-08-21 05:07:56.068	158	\N	243501	PENDING	MIDTRANS
249	\N	\N	2025-08-23 08:18:09.926	2025-08-23 08:18:09.926	229	\N	244802	PENDING	MIDTRANS
250	\N	\N	2025-08-23 08:34:21.014	2025-08-23 08:34:21.014	230	\N	244802	PENDING	MIDTRANS
178	\N	\N	2025-08-21 05:39:07.664	2025-08-21 05:39:07.664	159	\N	243501	PENDING	MIDTRANS
179	\N	\N	2025-08-21 05:41:53.725	2025-08-21 05:41:53.725	160	\N	243501	PENDING	MIDTRANS
180	\N	\N	2025-08-21 05:55:47.508	2025-08-21 05:55:47.508	161	\N	243501	PENDING	MIDTRANS
181	\N	\N	2025-08-21 05:56:53.121	2025-08-21 05:56:53.121	162	\N	243501	PENDING	MIDTRANS
182	\N	\N	2025-08-21 05:58:34.305	2025-08-21 05:58:34.305	163	\N	243501	PENDING	MIDTRANS
183	\N	\N	2025-08-21 06:14:04.538	2025-08-21 06:14:04.538	164	\N	243501	PENDING	MIDTRANS
184	\N	\N	2025-08-21 06:16:59.612	2025-08-21 06:16:59.612	165	\N	243501	PENDING	MIDTRANS
185	\N	\N	2025-08-21 06:19:28.78	2025-08-21 06:19:28.78	166	\N	243501	PENDING	MIDTRANS
186	\N	\N	2025-08-21 06:42:38.322	2025-08-21 06:42:38.322	167	\N	243501	PENDING	MIDTRANS
187	\N	\N	2025-08-21 06:53:22.007	2025-08-21 06:53:22.007	168	\N	243501	PENDING	MIDTRANS
188	\N	\N	2025-08-21 07:09:37.01	2025-08-21 07:09:37.01	169	\N	243501	PENDING	MIDTRANS
166	\N	2025-08-21 03:04:52.458	2025-08-21 03:04:52.459	2025-08-21 03:04:52.872	\N	62	243501	PAID	PAYPAL
176	\N	2025-08-21 05:08:44.056	2025-08-21 05:08:44.057	2025-08-21 05:08:45.42	\N	65	243501	PAID	PAYPAL
177	\N	2025-08-21 05:10:57.658	2025-08-21 05:10:57.659	2025-08-21 05:11:19.541	\N	66	243501	PAID	PAYPAL
189	\N	\N	2025-08-21 09:21:14.105	2025-08-21 09:21:14.105	170	\N	243501	PENDING	MIDTRANS
190	\N	\N	2025-08-21 09:29:00.055	2025-08-21 09:29:00.055	171	\N	243501	PENDING	MIDTRANS
191	\N	\N	2025-08-21 09:55:11.673	2025-08-21 09:55:11.673	172	\N	243501	PENDING	MIDTRANS
192	\N	\N	2025-08-21 10:03:13.897	2025-08-21 10:03:13.897	173	\N	243501	PENDING	MIDTRANS
193	\N	\N	2025-08-21 10:12:05.872	2025-08-21 10:12:05.872	174	\N	12175041	PENDING	MIDTRANS
194	\N	\N	2025-08-21 11:06:39.505	2025-08-21 11:06:39.505	175	\N	243501	PENDING	MIDTRANS
195	\N	\N	2025-08-21 11:21:46.022	2025-08-21 11:21:46.022	176	\N	243501	PENDING	MIDTRANS
196	\N	\N	2025-08-21 11:25:43.982	2025-08-21 11:25:43.982	177	\N	243501	PENDING	MIDTRANS
197	\N	\N	2025-08-21 11:27:01.781	2025-08-21 11:27:01.781	178	\N	243501	PENDING	MIDTRANS
198	\N	\N	2025-08-21 11:33:26.948	2025-08-21 11:33:26.948	179	\N	243501	PENDING	MIDTRANS
199	\N	\N	2025-08-21 12:00:30.484	2025-08-21 12:00:30.484	180	\N	243501	PENDING	MIDTRANS
200	\N	\N	2025-08-21 12:53:52.617	2025-08-21 12:53:52.617	181	\N	243501	PENDING	MIDTRANS
201	\N	\N	2025-08-21 12:53:59.001	2025-08-21 12:53:59.001	182	\N	243501	PENDING	MIDTRANS
202	\N	\N	2025-08-21 13:14:12.413	2025-08-21 13:14:12.413	183	\N	243501	PENDING	MIDTRANS
203	\N	\N	2025-08-21 13:25:11.787	2025-08-21 13:25:11.787	184	\N	243501	PENDING	MIDTRANS
204	\N	\N	2025-08-21 14:05:46.188	2025-08-21 14:05:46.188	185	\N	243501	PENDING	MIDTRANS
205	\N	\N	2025-08-21 14:15:16.405	2025-08-21 14:15:16.405	186	\N	243501	PENDING	MIDTRANS
206	\N	\N	2025-08-21 14:16:35.769	2025-08-21 14:16:35.769	187	\N	243501	PENDING	MIDTRANS
207	\N	\N	2025-08-21 14:35:07.892	2025-08-21 14:35:07.892	188	\N	243501	PENDING	MIDTRANS
208	\N	\N	2025-08-21 15:55:08.956	2025-08-21 15:55:08.956	189	\N	243501	PENDING	MIDTRANS
209	\N	\N	2025-08-21 16:31:53.432	2025-08-21 16:31:53.432	190	\N	243501	PENDING	MIDTRANS
210	\N	\N	2025-08-21 16:46:27.782	2025-08-21 16:46:27.782	191	\N	243501	PENDING	MIDTRANS
211	\N	\N	2025-08-21 20:33:19.801	2025-08-21 20:33:19.801	192	\N	243501	PENDING	MIDTRANS
212	\N	\N	2025-08-21 23:40:52.7	2025-08-21 23:40:52.7	193	\N	243501	PENDING	MIDTRANS
213	\N	\N	2025-08-22 02:08:48.482	2025-08-22 02:08:48.482	194	\N	244019	PENDING	MIDTRANS
214	\N	\N	2025-08-22 02:28:38.723	2025-08-22 02:28:38.723	195	\N	244019	PENDING	MIDTRANS
215	\N	\N	2025-08-22 02:28:47.705	2025-08-22 02:28:47.705	196	\N	244019	PENDING	MIDTRANS
216	\N	\N	2025-08-22 02:57:54.33	2025-08-22 02:57:54.33	197	\N	244019	PENDING	MIDTRANS
217	\N	\N	2025-08-22 03:26:33.614	2025-08-22 03:26:33.614	198	\N	244019	PENDING	MIDTRANS
218	\N	\N	2025-08-22 04:36:54.608	2025-08-22 04:36:54.608	199	\N	244019	PENDING	MIDTRANS
219	\N	\N	2025-08-22 05:19:32.76	2025-08-22 05:19:32.76	200	\N	244019	PENDING	MIDTRANS
220	\N	\N	2025-08-22 05:23:00.199	2025-08-22 05:23:00.199	201	\N	244019	PENDING	MIDTRANS
221	\N	\N	2025-08-22 05:43:49.741	2025-08-22 05:43:49.741	202	\N	244019	PENDING	MIDTRANS
222	\N	\N	2025-08-22 05:49:08.424	2025-08-22 05:49:08.424	203	\N	244019	PENDING	MIDTRANS
223	\N	\N	2025-08-22 06:24:06.276	2025-08-22 06:24:06.276	204	\N	244019	PENDING	MIDTRANS
224	\N	\N	2025-08-22 06:47:03.637	2025-08-22 06:47:03.637	205	\N	244019	PENDING	MIDTRANS
225	\N	\N	2025-08-22 09:15:28.702	2025-08-22 09:15:28.702	206	\N	244019	PENDING	MIDTRANS
226	\N	\N	2025-08-22 09:35:43.754	2025-08-22 09:35:43.754	207	\N	244019	PENDING	MIDTRANS
227	\N	\N	2025-08-22 09:37:05.135	2025-08-22 09:37:05.135	208	\N	244019	PENDING	MIDTRANS
228	\N	\N	2025-08-22 11:58:04.303	2025-08-22 11:58:04.303	209	\N	244019	PENDING	MIDTRANS
229	\N	\N	2025-08-22 12:58:00.082	2025-08-22 12:58:00.082	210	\N	244019	PENDING	MIDTRANS
230	\N	\N	2025-08-22 13:22:55.437	2025-08-22 13:22:55.437	211	\N	244019	PENDING	MIDTRANS
231	22	2025-08-22 14:35:38.57	2025-08-22 14:35:38.574	2025-08-22 14:35:40.171	\N	73	244019	PAID	PAYPAL
232	\N	\N	2025-08-22 15:10:46.907	2025-08-22 15:10:46.907	212	\N	244019	PENDING	MIDTRANS
233	\N	\N	2025-08-22 16:53:09.903	2025-08-22 16:53:09.903	213	\N	244019	PENDING	MIDTRANS
234	\N	\N	2025-08-22 17:03:09.978	2025-08-22 17:03:09.978	214	\N	244019	PENDING	MIDTRANS
235	\N	\N	2025-08-22 17:51:23.922	2025-08-22 17:51:23.922	215	\N	244019	PENDING	MIDTRANS
236	\N	\N	2025-08-22 18:10:57.74	2025-08-22 18:10:57.74	216	\N	244019	PENDING	MIDTRANS
237	\N	\N	2025-08-22 20:16:51.698	2025-08-22 20:16:51.698	217	\N	244019	PENDING	MIDTRANS
238	\N	\N	2025-08-23 02:22:25.82	2025-08-23 02:22:25.82	218	\N	244802	PENDING	MIDTRANS
239	\N	\N	2025-08-23 03:22:24.437	2025-08-23 03:22:24.437	219	\N	244802	PENDING	MIDTRANS
240	\N	\N	2025-08-23 03:28:31.461	2025-08-23 03:28:31.461	220	\N	244802	PENDING	MIDTRANS
241	\N	\N	2025-08-23 03:30:52.578	2025-08-23 03:30:52.578	221	\N	244802	PENDING	MIDTRANS
242	\N	\N	2025-08-23 03:48:16.772	2025-08-23 03:48:16.772	222	\N	244802	PENDING	MIDTRANS
243	\N	\N	2025-08-23 05:07:29.275	2025-08-23 05:07:29.275	223	\N	244802	PENDING	MIDTRANS
244	\N	\N	2025-08-23 05:12:03.047	2025-08-23 05:12:03.047	224	\N	244802	PENDING	MIDTRANS
245	\N	\N	2025-08-23 05:21:24.534	2025-08-23 05:21:24.534	225	\N	244802	PENDING	MIDTRANS
246	\N	\N	2025-08-23 07:01:08.602	2025-08-23 07:01:08.602	226	\N	244802	PENDING	MIDTRANS
247	\N	\N	2025-08-23 07:29:31.284	2025-08-23 07:29:31.284	227	\N	244802	PENDING	MIDTRANS
248	\N	\N	2025-08-23 08:06:29.533	2025-08-23 08:06:29.533	228	\N	244802	PENDING	MIDTRANS
251	\N	\N	2025-08-23 09:10:19.212	2025-08-23 09:10:19.212	231	\N	244802	PENDING	MIDTRANS
252	\N	\N	2025-08-23 10:12:16.854	2025-08-23 10:12:16.854	232	\N	244802	PENDING	MIDTRANS
253	23	\N	2025-08-23 11:57:30.955	2025-08-23 12:08:00.668	233	\N	244802	PENDING	MIDTRANS
254	\N	\N	2025-08-23 12:20:56.998	2025-08-23 12:20:56.998	234	\N	244802	PENDING	MIDTRANS
255	24	\N	2025-08-23 13:15:46.944	2025-08-23 13:21:53.728	235	\N	244802	PENDING	MIDTRANS
256	\N	\N	2025-08-23 14:37:33.807	2025-08-23 14:37:33.807	236	\N	244802	PENDING	MIDTRANS
257	\N	\N	2025-08-23 15:15:11.724	2025-08-23 15:15:11.724	237	\N	244802	PENDING	MIDTRANS
258	\N	\N	2025-08-23 15:26:12.213	2025-08-23 15:26:12.213	238	\N	244802	PENDING	MIDTRANS
259	\N	\N	2025-08-23 16:21:24.481	2025-08-23 16:21:24.481	239	\N	244802	PENDING	MIDTRANS
260	\N	\N	2025-08-23 17:36:04.433	2025-08-23 17:36:04.433	240	\N	244802	PENDING	MIDTRANS
261	\N	\N	2025-08-23 17:36:44.638	2025-08-23 17:36:44.638	241	\N	244802	PENDING	MIDTRANS
262	\N	\N	2025-08-23 17:39:08.022	2025-08-23 17:39:08.022	242	\N	244802	PENDING	MIDTRANS
263	\N	\N	2025-08-23 17:51:09.78	2025-08-23 17:51:09.78	243	\N	244802	PENDING	MIDTRANS
264	\N	\N	2025-08-23 18:16:24.46	2025-08-23 18:16:24.46	244	\N	244802	PENDING	MIDTRANS
265	\N	\N	2025-08-23 18:56:35.213	2025-08-23 18:56:35.213	245	\N	244802	PENDING	MIDTRANS
266	\N	\N	2025-08-23 18:57:13.023	2025-08-23 18:57:13.023	246	\N	244802	PENDING	MIDTRANS
267	\N	\N	2025-08-23 19:47:34.35	2025-08-23 19:47:34.35	247	\N	244802	PENDING	MIDTRANS
268	\N	\N	2025-08-23 21:43:29.201	2025-08-23 21:43:29.201	248	\N	244802	PENDING	MIDTRANS
269	\N	\N	2025-08-23 22:29:09.583	2025-08-23 22:29:09.583	249	\N	244802	PENDING	MIDTRANS
270	\N	\N	2025-08-24 01:22:41.547	2025-08-24 01:22:41.547	250	\N	244689	PENDING	MIDTRANS
271	\N	\N	2025-08-24 02:33:39.492	2025-08-24 02:33:39.492	251	\N	244689	PENDING	MIDTRANS
272	\N	\N	2025-08-24 03:00:12.485	2025-08-24 03:00:12.485	252	\N	244689	PENDING	MIDTRANS
273	\N	\N	2025-08-24 03:20:57.953	2025-08-24 03:20:57.953	253	\N	244689	PENDING	MIDTRANS
274	25	2025-08-24 03:37:32.879	2025-08-24 03:37:32.881	2025-08-24 03:37:39.69	\N	77	244689	PAID	PAYPAL
275	\N	\N	2025-08-24 04:25:02.366	2025-08-24 04:25:02.366	254	\N	244689	PENDING	MIDTRANS
276	\N	\N	2025-08-24 07:24:30.525	2025-08-24 07:24:30.525	255	\N	244689	PENDING	MIDTRANS
277	\N	\N	2025-08-24 07:41:22.395	2025-08-24 07:41:22.395	256	\N	244689	PENDING	MIDTRANS
278	\N	\N	2025-08-24 07:46:23.827	2025-08-24 07:46:23.827	257	\N	244689	PENDING	MIDTRANS
279	\N	\N	2025-08-24 07:46:55.684	2025-08-24 07:46:55.684	258	\N	244689	PENDING	MIDTRANS
280	\N	\N	2025-08-24 07:48:24.678	2025-08-24 07:48:24.678	259	\N	244689	PENDING	MIDTRANS
281	\N	\N	2025-08-24 07:48:52.974	2025-08-24 07:48:52.974	260	\N	244689	PENDING	MIDTRANS
282	\N	\N	2025-08-24 10:24:31.769	2025-08-24 10:24:31.769	261	\N	244689	PENDING	MIDTRANS
283	\N	\N	2025-08-24 12:02:35.528	2025-08-24 12:02:35.528	262	\N	244689	PENDING	MIDTRANS
284	\N	\N	2025-08-24 12:22:07.608	2025-08-24 12:22:07.608	263	\N	244689	PENDING	MIDTRANS
285	\N	\N	2025-08-24 13:27:52.164	2025-08-24 13:27:52.164	264	\N	244689	PENDING	MIDTRANS
286	\N	\N	2025-08-24 14:39:47.706	2025-08-24 14:39:47.706	265	\N	244689	PENDING	MIDTRANS
287	\N	\N	2025-08-24 14:50:48.971	2025-08-24 14:50:48.971	266	\N	244689	PENDING	MIDTRANS
288	\N	\N	2025-08-24 14:51:08.976	2025-08-24 14:51:08.976	267	\N	244689	PENDING	MIDTRANS
289	\N	\N	2025-08-24 14:54:25.215	2025-08-24 14:54:25.215	268	\N	244689	PENDING	MIDTRANS
290	\N	\N	2025-08-24 14:54:46.444	2025-08-24 14:54:46.444	269	\N	244689	PENDING	MIDTRANS
291	\N	\N	2025-08-24 14:56:38.863	2025-08-24 14:56:38.863	270	\N	244689	PENDING	MIDTRANS
292	\N	\N	2025-08-24 14:56:55.944	2025-08-24 14:56:55.944	271	\N	244689	PENDING	MIDTRANS
293	\N	\N	2025-08-24 15:03:42.402	2025-08-24 15:03:42.402	272	\N	244689	PENDING	MIDTRANS
294	\N	\N	2025-08-24 15:09:32.393	2025-08-24 15:09:32.393	273	\N	244689	PENDING	MIDTRANS
295	\N	\N	2025-08-24 16:32:27.359	2025-08-24 16:32:27.359	274	\N	244689	PENDING	MIDTRANS
296	\N	\N	2025-08-24 17:19:33.154	2025-08-24 17:19:33.154	275	\N	244689	PENDING	MIDTRANS
297	\N	\N	2025-08-24 20:20:17.544	2025-08-24 20:20:17.544	276	\N	244689	PENDING	MIDTRANS
298	\N	\N	2025-08-24 20:44:13.558	2025-08-24 20:44:13.558	277	\N	244689	PENDING	MIDTRANS
299	\N	\N	2025-08-24 21:27:01.072	2025-08-24 21:27:01.072	278	\N	244689	PENDING	MIDTRANS
300	\N	\N	2025-08-24 23:42:34.048	2025-08-24 23:42:34.048	279	\N	244689	PENDING	MIDTRANS
301	\N	\N	2025-08-25 01:50:03.917	2025-08-25 01:50:03.917	280	\N	244985	PENDING	MIDTRANS
302	\N	\N	2025-08-25 03:33:22.881	2025-08-25 03:33:22.881	281	\N	244985	PENDING	MIDTRANS
303	\N	\N	2025-08-25 05:09:31.499	2025-08-25 05:09:31.499	282	\N	244985	PENDING	MIDTRANS
304	\N	\N	2025-08-25 05:19:48.743	2025-08-25 05:19:48.743	283	\N	244985	PENDING	MIDTRANS
305	\N	\N	2025-08-25 05:41:27.441	2025-08-25 05:41:27.441	284	\N	244985	PENDING	MIDTRANS
306	\N	\N	2025-08-25 05:42:47.895	2025-08-25 05:42:47.895	285	\N	244985	PENDING	MIDTRANS
307	\N	\N	2025-08-25 05:43:30.76	2025-08-25 05:43:30.76	286	\N	244985	PENDING	MIDTRANS
308	\N	\N	2025-08-25 05:44:14.307	2025-08-25 05:44:14.307	287	\N	244985	PENDING	MIDTRANS
309	\N	\N	2025-08-25 07:47:27.669	2025-08-25 07:47:27.669	288	\N	244985	PENDING	MIDTRANS
310	\N	\N	2025-08-25 08:20:03.906	2025-08-25 08:20:03.906	289	\N	244985	PENDING	MIDTRANS
311	\N	\N	2025-08-25 10:48:03.009	2025-08-25 10:48:03.009	290	\N	244985	PENDING	MIDTRANS
312	26	2025-08-25 10:56:21.796	2025-08-25 10:56:21.8	2025-08-25 10:56:25.446	\N	79	244985	PAID	PAYPAL
313	\N	\N	2025-08-25 12:02:06.177	2025-08-25 12:02:06.177	291	\N	244985	PENDING	MIDTRANS
314	\N	\N	2025-08-25 14:38:58.791	2025-08-25 14:38:58.791	292	\N	244985	PENDING	MIDTRANS
315	\N	\N	2025-08-25 17:42:43.678	2025-08-25 17:42:43.678	293	\N	244985	PENDING	MIDTRANS
316	\N	\N	2025-08-25 17:48:53.54	2025-08-25 17:48:53.54	294	\N	244985	PENDING	MIDTRANS
317	\N	\N	2025-08-25 23:56:29.039	2025-08-25 23:56:29.039	295	\N	244985	PENDING	MIDTRANS
318	\N	\N	2025-08-26 00:13:44.749	2025-08-26 00:13:44.749	296	\N	243531	PENDING	MIDTRANS
319	\N	\N	2025-08-26 01:24:46.785	2025-08-26 01:24:46.785	297	\N	243531	PENDING	MIDTRANS
320	\N	\N	2025-08-26 01:44:53.58	2025-08-26 01:44:53.58	298	\N	243531	PENDING	MIDTRANS
321	\N	\N	2025-08-26 01:52:45.415	2025-08-26 01:52:45.415	299	\N	243531	PENDING	MIDTRANS
322	\N	\N	2025-08-26 02:09:11.509	2025-08-26 02:09:11.509	300	\N	243531	PENDING	MIDTRANS
323	\N	\N	2025-08-26 02:18:34.748	2025-08-26 02:18:34.748	301	\N	243531	PENDING	MIDTRANS
324	\N	\N	2025-08-26 02:20:54.278	2025-08-26 02:20:54.278	302	\N	243531	PENDING	MIDTRANS
325	\N	\N	2025-08-26 02:26:58.576	2025-08-26 02:26:58.576	303	\N	243531	PENDING	MIDTRANS
326	27	2025-08-26 02:27:27.639	2025-08-26 02:27:27.64	2025-08-26 02:27:28.58	\N	81	243531	PAID	PAYPAL
327	28	\N	2025-08-26 03:10:45.192	2025-08-26 03:12:05.957	304	\N	243531	PENDING	MIDTRANS
328	\N	\N	2025-08-26 03:39:22.851	2025-08-26 03:39:22.851	305	\N	243531	PENDING	MIDTRANS
329	29	\N	2025-08-26 04:54:52.858	2025-08-26 04:55:58.127	306	\N	243531	PENDING	MIDTRANS
332	\N	\N	2025-08-26 05:02:35.934	2025-08-26 05:02:35.934	309	\N	243531	PENDING	MIDTRANS
333	\N	\N	2025-08-26 05:03:25.85	2025-08-26 05:03:25.85	310	\N	243531	PENDING	MIDTRANS
330	30	\N	2025-08-26 04:55:24.044	2025-08-26 05:04:00.169	307	\N	243531	PENDING	MIDTRANS
331	31	\N	2025-08-26 05:02:33.281	2025-08-26 05:06:44.66	308	\N	243531	PENDING	MIDTRANS
338	35	\N	2025-08-26 07:33:44.166	2025-08-26 07:35:18.434	314	\N	243531	PENDING	MIDTRANS
334	33	\N	2025-08-26 05:54:50.223	2025-08-26 05:58:10.709	311	\N	243531	PENDING	MIDTRANS
335	\N	\N	2025-08-26 06:34:34.222	2025-08-26 06:34:34.222	312	\N	243531	PENDING	MIDTRANS
336	34	2025-08-26 06:34:59.005	2025-08-26 06:34:59.006	2025-08-26 06:35:07.607	\N	85	243531	PAID	PAYPAL
337	\N	\N	2025-08-26 07:23:29.507	2025-08-26 07:23:29.507	313	\N	243531	PENDING	MIDTRANS
339	\N	\N	2025-08-26 07:58:15.451	2025-08-26 07:58:15.451	315	\N	243531	PENDING	MIDTRANS
341	\N	\N	2025-08-26 07:59:26.682	2025-08-26 07:59:26.682	317	\N	243531	PENDING	MIDTRANS
342	36	\N	2025-08-26 08:01:03.041	2025-08-26 08:05:07.677	318	\N	243531	PENDING	MIDTRANS
340	37	\N	2025-08-26 07:59:11.782	2025-08-26 08:05:19.707	316	\N	243531	PENDING	MIDTRANS
343	\N	\N	2025-08-26 08:22:34.944	2025-08-26 08:22:34.944	319	\N	243531	PENDING	MIDTRANS
344	\N	\N	2025-08-26 08:43:58.152	2025-08-26 08:43:58.152	320	\N	243531	PENDING	MIDTRANS
345	38	\N	2025-08-26 09:06:10.382	2025-08-26 09:09:28.737	321	\N	243531	PENDING	MIDTRANS
346	\N	\N	2025-08-26 09:25:32.199	2025-08-26 09:25:32.199	322	\N	243531	PENDING	MIDTRANS
347	\N	\N	2025-08-26 09:36:28.529	2025-08-26 09:36:28.529	323	\N	243531	PENDING	MIDTRANS
348	\N	\N	2025-08-26 10:16:21.58	2025-08-26 10:16:21.58	324	\N	243531	PENDING	MIDTRANS
349	\N	\N	2025-08-26 10:23:39.231	2025-08-26 10:23:39.231	325	\N	243531	PENDING	MIDTRANS
350	\N	\N	2025-08-26 10:46:44.114	2025-08-26 10:46:44.114	326	\N	243531	PENDING	MIDTRANS
351	\N	\N	2025-08-26 13:07:33.394	2025-08-26 13:07:33.394	327	\N	243531	PENDING	MIDTRANS
352	\N	\N	2025-08-26 13:10:08.09	2025-08-26 13:10:08.09	328	\N	243531	PENDING	MIDTRANS
353	\N	\N	2025-08-26 14:08:48.815	2025-08-26 14:08:48.815	329	\N	243531	PENDING	MIDTRANS
354	\N	\N	2025-08-26 14:27:51.982	2025-08-26 14:27:51.982	330	\N	243531	PENDING	MIDTRANS
355	\N	\N	2025-08-26 14:57:19.645	2025-08-26 14:57:19.645	331	\N	243531	PENDING	MIDTRANS
356	\N	\N	2025-08-26 15:03:32.87	2025-08-26 15:03:32.87	332	\N	243531	PENDING	MIDTRANS
357	39	2025-08-26 15:11:34.423	2025-08-26 15:11:34.425	2025-08-26 15:11:37.238	\N	87	243531	PAID	PAYPAL
358	\N	\N	2025-08-26 15:21:38.069	2025-08-26 15:21:38.069	333	\N	243531	PENDING	MIDTRANS
359	\N	\N	2025-08-26 15:26:29.841	2025-08-26 15:26:29.841	334	\N	243531	PENDING	MIDTRANS
360	\N	\N	2025-08-26 15:32:16.732	2025-08-26 15:32:16.732	335	\N	243531	PENDING	MIDTRANS
361	\N	\N	2025-08-26 16:55:42.125	2025-08-26 16:55:42.125	336	\N	243531	PENDING	MIDTRANS
362	\N	\N	2025-08-26 16:59:04.336	2025-08-26 16:59:04.336	337	\N	243531	PENDING	MIDTRANS
363	\N	\N	2025-08-26 19:11:49.111	2025-08-26 19:11:49.111	338	\N	243531	PENDING	MIDTRANS
364	\N	\N	2025-08-26 20:57:16.645	2025-08-26 20:57:16.645	339	\N	243531	PENDING	MIDTRANS
365	\N	\N	2025-08-26 23:28:58.168	2025-08-26 23:28:58.168	340	\N	243531	PENDING	MIDTRANS
366	\N	\N	2025-08-27 02:27:08.33	2025-08-27 02:27:08.33	341	\N	243872	PENDING	MIDTRANS
367	\N	\N	2025-08-27 02:51:57.174	2025-08-27 02:51:57.174	342	\N	243872	PENDING	MIDTRANS
368	\N	\N	2025-08-27 02:56:24.833	2025-08-27 02:56:24.833	343	\N	243872	PENDING	MIDTRANS
369	40	\N	2025-08-27 03:50:22.899	2025-08-27 03:53:47.493	344	\N	243872	PENDING	MIDTRANS
370	\N	\N	2025-08-27 05:51:40.425	2025-08-27 05:51:40.425	345	\N	243872	PENDING	MIDTRANS
371	\N	\N	2025-08-27 05:53:32.943	2025-08-27 05:53:32.943	346	\N	243872	PENDING	MIDTRANS
372	\N	\N	2025-08-27 05:54:43.093	2025-08-27 05:54:43.093	347	\N	243872	PENDING	MIDTRANS
373	\N	\N	2025-08-27 05:54:45.577	2025-08-27 05:54:45.577	348	\N	243872	PENDING	MIDTRANS
374	\N	\N	2025-08-27 05:55:01.991	2025-08-27 05:55:01.991	349	\N	243872	PENDING	MIDTRANS
375	\N	\N	2025-08-27 05:55:47.292	2025-08-27 05:55:47.292	350	\N	243872	PENDING	MIDTRANS
376	\N	\N	2025-08-27 05:59:30.258	2025-08-27 05:59:30.258	351	\N	243872	PENDING	MIDTRANS
377	41	\N	2025-08-27 06:04:49.936	2025-08-27 06:06:57.911	352	\N	243872	PENDING	MIDTRANS
378	\N	\N	2025-08-27 06:11:22.447	2025-08-27 06:11:22.447	353	\N	243872	PENDING	MIDTRANS
379	\N	\N	2025-08-27 06:11:33.321	2025-08-27 06:11:33.321	354	\N	243872	PENDING	MIDTRANS
380	\N	\N	2025-08-27 06:14:06.565	2025-08-27 06:14:06.565	355	\N	243872	PENDING	MIDTRANS
381	\N	\N	2025-08-27 06:15:01.024	2025-08-27 06:15:01.024	356	\N	243872	PENDING	MIDTRANS
382	\N	\N	2025-08-27 06:17:00.136	2025-08-27 06:17:00.136	357	\N	243872	PENDING	MIDTRANS
383	\N	\N	2025-08-27 06:19:19.47	2025-08-27 06:19:19.47	358	\N	12193602	PENDING	MIDTRANS
384	\N	\N	2025-08-27 06:23:31.563	2025-08-27 06:23:31.563	359	\N	243872	PENDING	MIDTRANS
385	\N	\N	2025-08-27 06:24:29.01	2025-08-27 06:24:29.01	360	\N	243872	PENDING	MIDTRANS
386	\N	\N	2025-08-27 06:25:39.14	2025-08-27 06:25:39.14	361	\N	243872	PENDING	MIDTRANS
387	\N	\N	2025-08-27 06:25:54.819	2025-08-27 06:25:54.819	362	\N	243872	PENDING	MIDTRANS
388	\N	\N	2025-08-27 06:30:15.53	2025-08-27 06:30:15.53	363	\N	243872	PENDING	MIDTRANS
389	\N	\N	2025-08-27 06:50:58.177	2025-08-27 06:50:58.177	364	\N	243872	PENDING	MIDTRANS
390	\N	\N	2025-08-27 06:57:37.634	2025-08-27 06:57:37.634	365	\N	243872	PENDING	MIDTRANS
391	\N	\N	2025-08-27 06:59:04.18	2025-08-27 06:59:04.18	366	\N	243872	PENDING	MIDTRANS
392	\N	\N	2025-08-27 07:15:06.87	2025-08-27 07:15:06.87	367	\N	243872	PENDING	MIDTRANS
393	\N	\N	2025-08-27 07:27:42.483	2025-08-27 07:27:42.483	368	\N	243872	PENDING	MIDTRANS
394	\N	\N	2025-08-27 07:28:34.59	2025-08-27 07:28:34.59	369	\N	243872	PENDING	MIDTRANS
396	\N	\N	2025-08-27 07:37:30.456	2025-08-27 07:37:30.456	371	\N	243872	PENDING	MIDTRANS
395	42	\N	2025-08-27 07:36:14.081	2025-08-27 07:38:52.28	370	\N	243872	PENDING	MIDTRANS
397	43	\N	2025-08-27 07:48:32.749	2025-08-27 07:50:10.573	372	\N	243872	PENDING	MIDTRANS
398	44	2025-08-27 07:58:13.898	2025-08-27 07:58:13.9	2025-08-27 07:58:17.873	\N	102	243872	PAID	PAYPAL
399	45	2025-08-27 08:05:08.914	2025-08-27 08:05:08.915	2025-08-27 08:05:35.71	\N	103	243872	PAID	PAYPAL
400	\N	\N	2025-08-27 08:24:31.456	2025-08-27 08:24:31.456	373	\N	243872	PENDING	MIDTRANS
401	\N	\N	2025-08-27 08:48:37.006	2025-08-27 08:48:37.006	374	\N	243872	PENDING	MIDTRANS
402	46	\N	2025-08-27 09:29:50.742	2025-08-27 09:31:53.62	375	\N	243872	PENDING	MIDTRANS
403	47	2025-08-27 09:36:03.131	2025-08-27 09:36:03.132	2025-08-27 09:36:04.47	\N	106	243872	PAID	PAYPAL
404	\N	\N	2025-08-27 09:41:44.69	2025-08-27 09:41:44.69	376	\N	243872	PENDING	MIDTRANS
405	\N	\N	2025-08-27 09:43:36.178	2025-08-27 09:43:36.178	377	\N	243872	PENDING	MIDTRANS
406	\N	\N	2025-08-27 09:43:36.688	2025-08-27 09:43:36.688	378	\N	243872	PENDING	MIDTRANS
407	\N	\N	2025-08-27 09:45:43.791	2025-08-27 09:45:43.791	379	\N	243872	PENDING	MIDTRANS
408	48	\N	2025-08-27 09:52:02.279	2025-08-27 09:53:37.398	380	\N	243872	PENDING	MIDTRANS
409	\N	\N	2025-08-27 09:54:55.041	2025-08-27 09:54:55.041	381	\N	243872	PENDING	MIDTRANS
410	\N	\N	2025-08-27 09:55:48.436	2025-08-27 09:55:48.436	382	\N	243872	PENDING	MIDTRANS
411	\N	\N	2025-08-27 10:01:15.487	2025-08-27 10:01:15.487	383	\N	243872	PENDING	MIDTRANS
412	\N	\N	2025-08-27 10:01:31.121	2025-08-27 10:01:31.121	384	\N	243872	PENDING	MIDTRANS
413	\N	\N	2025-08-27 10:06:22.338	2025-08-27 10:06:22.338	385	\N	243872	PENDING	MIDTRANS
414	\N	\N	2025-08-27 10:30:15.712	2025-08-27 10:30:15.712	386	\N	243872	PENDING	MIDTRANS
415	\N	\N	2025-08-27 10:41:12.407	2025-08-27 10:41:12.407	387	\N	243872	PENDING	MIDTRANS
416	\N	\N	2025-08-27 10:48:56.083	2025-08-27 10:48:56.083	388	\N	243872	PENDING	MIDTRANS
417	\N	\N	2025-08-27 10:49:21.358	2025-08-27 10:49:21.358	389	\N	243872	PENDING	MIDTRANS
418	\N	\N	2025-08-27 11:18:22.927	2025-08-27 11:18:22.927	390	\N	243872	PENDING	MIDTRANS
419	\N	\N	2025-08-27 11:28:16.165	2025-08-27 11:28:16.165	391	\N	243872	PENDING	MIDTRANS
420	\N	\N	2025-08-27 12:45:47.428	2025-08-27 12:45:47.428	392	\N	243872	PENDING	MIDTRANS
421	\N	\N	2025-08-27 12:48:12.729	2025-08-27 12:48:12.729	393	\N	243872	PENDING	MIDTRANS
422	\N	\N	2025-08-27 13:25:21.735	2025-08-27 13:25:21.735	394	\N	243872	PENDING	MIDTRANS
423	49	\N	2025-08-27 13:30:00.765	2025-08-27 13:31:21.223	395	\N	243872	PENDING	MIDTRANS
424	\N	\N	2025-08-27 13:48:42.499	2025-08-27 13:48:42.499	396	\N	12193602	PENDING	MIDTRANS
425	\N	\N	2025-08-27 13:49:19.251	2025-08-27 13:49:19.251	397	\N	243872	PENDING	MIDTRANS
426	\N	\N	2025-08-27 13:50:42.143	2025-08-27 13:50:42.143	398	\N	243872	PENDING	MIDTRANS
427	50	2025-08-27 13:51:40.25	2025-08-27 13:51:40.252	2025-08-27 13:51:42.577	\N	110	243872	PAID	PAYPAL
428	\N	\N	2025-08-27 14:19:34.767	2025-08-27 14:19:34.767	399	\N	243872	PENDING	MIDTRANS
429	\N	\N	2025-08-27 14:30:13.074	2025-08-27 14:30:13.074	400	\N	243872	PENDING	MIDTRANS
430	\N	\N	2025-08-27 15:17:20.206	2025-08-27 15:17:20.206	401	\N	243872	PENDING	MIDTRANS
431	\N	\N	2025-08-27 16:11:46.973	2025-08-27 16:11:46.973	402	\N	243872	PENDING	MIDTRANS
432	\N	\N	2025-08-27 16:27:03.062	2025-08-27 16:27:03.062	403	\N	243872	PENDING	MIDTRANS
433	\N	\N	2025-08-27 16:38:56.711	2025-08-27 16:38:56.711	404	\N	243872	PENDING	MIDTRANS
434	51	2025-08-27 16:41:09.91	2025-08-27 16:41:09.912	2025-08-27 16:41:11.026	\N	112	243872	PAID	PAYPAL
435	\N	\N	2025-08-27 18:32:32.998	2025-08-27 18:32:32.998	405	\N	243872	PENDING	MIDTRANS
436	\N	\N	2025-08-27 19:06:00.501	2025-08-27 19:06:00.501	406	\N	243872	PENDING	MIDTRANS
437	\N	\N	2025-08-27 20:38:35.385	2025-08-27 20:38:35.385	407	\N	243872	PENDING	MIDTRANS
438	\N	\N	2025-08-27 21:34:14.34	2025-08-27 21:34:14.34	408	\N	243872	PENDING	MIDTRANS
439	\N	\N	2025-08-27 23:30:29.941	2025-08-27 23:30:29.941	409	\N	243872	PENDING	MIDTRANS
440	\N	\N	2025-08-28 00:01:11.523	2025-08-28 00:01:11.523	410	\N	245081	PENDING	MIDTRANS
441	\N	\N	2025-08-28 00:30:42.922	2025-08-28 00:30:42.922	411	\N	245081	PENDING	MIDTRANS
442	\N	\N	2025-08-28 00:41:30.271	2025-08-28 00:41:30.271	412	\N	245081	PENDING	MIDTRANS
443	\N	\N	2025-08-28 00:49:00.115	2025-08-28 00:49:00.115	413	\N	245081	PENDING	MIDTRANS
444	\N	\N	2025-08-28 01:27:29.694	2025-08-28 01:27:29.694	414	\N	245081	PENDING	MIDTRANS
445	\N	\N	2025-08-28 01:32:51.839	2025-08-28 01:32:51.839	415	\N	245081	PENDING	MIDTRANS
446	\N	\N	2025-08-28 02:13:01.173	2025-08-28 02:13:01.173	416	\N	245081	PENDING	MIDTRANS
447	\N	\N	2025-08-28 02:44:39.403	2025-08-28 02:44:39.403	417	\N	245081	PENDING	MIDTRANS
448	\N	\N	2025-08-28 02:45:23.868	2025-08-28 02:45:23.868	418	\N	245081	PENDING	MIDTRANS
449	\N	\N	2025-08-28 02:49:02.141	2025-08-28 02:49:02.141	419	\N	245081	PENDING	MIDTRANS
450	\N	\N	2025-08-28 02:52:03.899	2025-08-28 02:52:03.899	420	\N	245081	PENDING	MIDTRANS
451	\N	\N	2025-08-28 07:02:56.776	2025-08-28 07:02:56.776	421	\N	245081	PENDING	MIDTRANS
452	\N	\N	2025-08-28 07:55:47.567	2025-08-28 07:55:47.567	422	\N	245081	PENDING	MIDTRANS
454	\N	\N	2025-08-28 08:51:39.32	2025-08-28 08:51:39.32	424	\N	245081	PENDING	MIDTRANS
455	\N	\N	2025-08-28 09:19:08.606	2025-08-28 09:19:08.606	425	\N	245081	PENDING	MIDTRANS
456	52	\N	2025-08-28 09:20:24.671	2025-08-28 09:31:41.125	426	\N	245081	PENDING	MIDTRANS
453	53	\N	2025-08-28 08:29:51.898	2025-08-28 09:40:16.739	423	\N	245081	PENDING	MIDTRANS
457	\N	\N	2025-08-28 10:50:29.688	2025-08-28 10:50:29.688	427	\N	245081	PENDING	MIDTRANS
458	\N	\N	2025-08-28 10:54:23.949	2025-08-28 10:54:23.949	428	\N	245081	PENDING	MIDTRANS
459	\N	\N	2025-08-28 11:31:49.977	2025-08-28 11:31:49.977	429	\N	245081	PENDING	MIDTRANS
460	\N	\N	2025-08-28 11:44:06.209	2025-08-28 11:44:06.209	430	\N	245081	PENDING	MIDTRANS
461	\N	\N	2025-08-28 11:52:15.12	2025-08-28 11:52:15.12	431	\N	245081	PENDING	MIDTRANS
504	\N	\N	2025-08-30 07:20:28.682	2025-08-30 07:20:28.682	473	\N	246910	PENDING	MIDTRANS
505	\N	\N	2025-08-30 07:49:10.37	2025-08-30 07:49:10.37	474	\N	246910	PENDING	MIDTRANS
462	57	\N	2025-08-28 12:10:40.436	2025-08-28 12:13:36.122	432	\N	245081	PENDING	MIDTRANS
463	\N	\N	2025-08-28 12:26:01.43	2025-08-28 12:26:01.43	433	\N	245081	PENDING	MIDTRANS
464	\N	\N	2025-08-28 12:38:01.867	2025-08-28 12:38:01.867	434	\N	245081	PENDING	MIDTRANS
466	\N	\N	2025-08-28 12:52:05.911	2025-08-28 12:52:05.911	436	\N	245081	PENDING	MIDTRANS
467	\N	\N	2025-08-28 12:52:16.299	2025-08-28 12:52:16.299	437	\N	245081	PENDING	MIDTRANS
468	\N	\N	2025-08-28 12:54:50.842	2025-08-28 12:54:50.842	438	\N	245081	PENDING	MIDTRANS
465	58	\N	2025-08-28 12:46:06.475	2025-08-28 13:07:44.83	435	\N	245081	PENDING	MIDTRANS
470	\N	\N	2025-08-28 13:15:32.349	2025-08-28 13:15:32.349	440	\N	245081	PENDING	MIDTRANS
469	59	\N	2025-08-28 13:09:12.184	2025-08-28 13:25:43.352	439	\N	245081	PENDING	MIDTRANS
471	\N	\N	2025-08-28 13:37:09.678	2025-08-28 13:37:09.678	441	\N	245081	PENDING	MIDTRANS
472	\N	\N	2025-08-28 13:55:41.987	2025-08-28 13:55:41.987	442	\N	245081	PENDING	MIDTRANS
473	\N	\N	2025-08-28 15:08:58.511	2025-08-28 15:08:58.511	443	\N	245081	PENDING	MIDTRANS
474	\N	\N	2025-08-28 15:12:57.263	2025-08-28 15:12:57.263	444	\N	245081	PENDING	MIDTRANS
475	60	\N	2025-08-28 15:28:31.675	2025-08-28 15:36:10.312	445	\N	245081	PENDING	MIDTRANS
476	\N	\N	2025-08-28 16:02:01.414	2025-08-28 16:02:01.414	446	\N	245081	PENDING	MIDTRANS
477	\N	\N	2025-08-28 16:03:59.681	2025-08-28 16:03:59.681	447	\N	245081	PENDING	MIDTRANS
478	\N	\N	2025-08-28 18:04:21.213	2025-08-28 18:04:21.213	448	\N	245081	PENDING	MIDTRANS
479	\N	\N	2025-08-28 19:29:31.134	2025-08-28 19:29:31.134	449	\N	245081	PENDING	MIDTRANS
480	\N	\N	2025-08-28 19:41:04.307	2025-08-28 19:41:04.307	450	\N	245081	PENDING	MIDTRANS
481	\N	\N	2025-08-28 20:49:15.562	2025-08-28 20:49:15.562	451	\N	245081	PENDING	MIDTRANS
482	\N	\N	2025-08-28 21:35:56.568	2025-08-28 21:35:56.568	452	\N	245081	PENDING	MIDTRANS
483	\N	\N	2025-08-28 21:41:42.188	2025-08-28 21:41:42.188	453	\N	245081	PENDING	MIDTRANS
484	\N	\N	2025-08-29 00:55:24.4	2025-08-29 00:55:24.4	454	\N	245059	PENDING	MIDTRANS
485	\N	\N	2025-08-29 03:43:07.32	2025-08-29 03:43:07.32	455	\N	245059	PENDING	MIDTRANS
486	\N	\N	2025-08-29 03:51:55.856	2025-08-29 03:51:55.856	456	\N	245059	PENDING	MIDTRANS
487	\N	\N	2025-08-29 04:42:09.943	2025-08-29 04:42:09.943	457	\N	245059	PENDING	MIDTRANS
488	61	2025-08-29 04:50:28.3	2025-08-29 04:50:28.303	2025-08-29 04:50:30.827	\N	121	245059	PAID	PAYPAL
489	\N	\N	2025-08-29 06:28:15.364	2025-08-29 06:28:15.364	458	\N	245059	PENDING	MIDTRANS
490	62	\N	2025-08-29 06:41:33.314	2025-08-29 07:17:26.482	459	\N	245059	PENDING	MIDTRANS
491	\N	\N	2025-08-29 07:42:08.124	2025-08-29 07:42:08.124	460	\N	245059	PENDING	MIDTRANS
492	63	\N	2025-08-29 07:45:43.081	2025-08-29 07:46:59.058	461	\N	245059	PENDING	MIDTRANS
493	\N	\N	2025-08-29 08:35:56.307	2025-08-29 08:35:56.307	462	\N	245059	PENDING	MIDTRANS
494	\N	\N	2025-08-29 08:36:26.17	2025-08-29 08:36:26.17	463	\N	245059	PENDING	MIDTRANS
495	64	\N	2025-08-29 08:58:00.211	2025-08-29 09:04:28.077	464	\N	245059	PENDING	MIDTRANS
496	65	\N	2025-08-29 10:21:20.954	2025-08-29 10:28:20.421	465	\N	245059	PENDING	MIDTRANS
497	\N	\N	2025-08-29 11:42:59.139	2025-08-29 11:42:59.139	466	\N	245059	PENDING	MIDTRANS
498	\N	\N	2025-08-29 12:50:45.675	2025-08-29 12:50:45.675	467	\N	245059	PENDING	MIDTRANS
499	\N	\N	2025-08-29 13:06:40.108	2025-08-29 13:06:40.108	468	\N	245059	PENDING	MIDTRANS
500	\N	\N	2025-08-30 02:23:14.664	2025-08-30 02:23:14.664	469	\N	246910	PENDING	MIDTRANS
501	\N	\N	2025-08-30 05:59:20.95	2025-08-30 05:59:20.95	470	\N	246910	PENDING	MIDTRANS
502	\N	\N	2025-08-30 06:08:08.144	2025-08-30 06:08:08.144	471	\N	246910	PENDING	MIDTRANS
503	\N	\N	2025-08-30 07:11:14.552	2025-08-30 07:11:14.552	472	\N	246910	PENDING	MIDTRANS
506	66	\N	2025-08-30 08:10:41.039	2025-08-30 08:12:58.61	475	\N	246910	PENDING	MIDTRANS
507	\N	\N	2025-08-30 09:43:15.588	2025-08-30 09:43:15.588	476	\N	246910	PENDING	MIDTRANS
508	\N	\N	2025-08-30 12:10:08.26	2025-08-30 12:10:08.26	477	\N	246910	PENDING	MIDTRANS
509	\N	\N	2025-08-30 13:34:31.312	2025-08-30 13:34:31.312	478	\N	246910	PENDING	MIDTRANS
510	\N	\N	2025-08-30 13:39:46.572	2025-08-30 13:39:46.572	479	\N	246910	PENDING	MIDTRANS
511	67	2025-08-30 13:46:14.419	2025-08-30 13:46:14.42	2025-08-30 13:46:15.529	\N	128	246910	PAID	PAYPAL
512	\N	\N	2025-08-30 14:52:04.481	2025-08-30 14:52:04.481	480	\N	246910	PENDING	MIDTRANS
513	68	\N	2025-08-30 15:23:35.672	2025-08-30 15:26:15.347	481	\N	246910	PENDING	MIDTRANS
514	69	\N	2025-08-30 15:27:27.297	2025-08-30 15:29:00.799	482	\N	246910	PENDING	MIDTRANS
515	\N	\N	2025-08-30 15:31:55.598	2025-08-30 15:31:55.598	483	\N	246910	PENDING	MIDTRANS
516	\N	\N	2025-08-30 15:44:43.464	2025-08-30 15:44:43.464	484	\N	246910	PENDING	MIDTRANS
517	\N	\N	2025-08-30 16:08:21.662	2025-08-30 16:08:21.662	485	\N	246910	PENDING	MIDTRANS
518	70	2025-08-30 16:15:15.873	2025-08-30 16:15:15.874	2025-08-30 16:15:18.294	\N	129	246910	PAID	PAYPAL
519	71	2025-08-30 18:14:36.495	2025-08-30 18:14:36.498	2025-08-30 18:14:42.476	\N	131	246910	PAID	PAYPAL
520	72	2025-08-31 00:14:24.701	2025-08-31 00:14:24.736	2025-08-31 00:14:29.644	\N	132	246725	PAID	PAYPAL
521	\N	\N	2025-08-31 03:42:45.648	2025-08-31 03:42:45.648	486	\N	246725	PENDING	MIDTRANS
522	\N	\N	2025-08-31 08:45:12.968	2025-08-31 08:45:12.968	487	\N	246725	PENDING	MIDTRANS
523	\N	\N	2025-08-31 11:43:40.759	2025-08-31 11:43:40.759	488	\N	246725	PENDING	MIDTRANS
524	\N	\N	2025-08-31 12:06:30.783	2025-08-31 12:06:30.783	489	\N	246725	PENDING	MIDTRANS
525	\N	\N	2025-08-31 12:09:18.484	2025-08-31 12:09:18.484	490	\N	246725	PENDING	MIDTRANS
526	\N	\N	2025-08-31 13:03:13.777	2025-08-31 13:03:13.777	491	\N	246725	PENDING	MIDTRANS
527	\N	\N	2025-08-31 13:35:44.412	2025-08-31 13:35:44.412	492	\N	246725	PENDING	MIDTRANS
528	\N	\N	2025-08-31 14:17:28.488	2025-08-31 14:17:28.488	493	\N	246725	PENDING	MIDTRANS
529	\N	\N	2025-08-31 14:41:48.07	2025-08-31 14:41:48.07	494	\N	246725	PENDING	MIDTRANS
530	\N	\N	2025-08-31 14:55:51.266	2025-08-31 14:55:51.266	495	\N	246725	PENDING	MIDTRANS
531	\N	\N	2025-08-31 14:57:33.419	2025-08-31 14:57:33.419	496	\N	246725	PENDING	MIDTRANS
532	\N	\N	2025-08-31 16:04:42.382	2025-08-31 16:04:42.382	497	\N	246725	PENDING	MIDTRANS
533	\N	\N	2025-08-31 17:24:35.6	2025-08-31 17:24:35.6	498	\N	246725	PENDING	MIDTRANS
534	\N	\N	2025-08-31 18:00:31.012	2025-08-31 18:00:31.012	499	\N	246725	PENDING	MIDTRANS
535	\N	\N	2025-08-31 18:15:33.976	2025-08-31 18:15:33.976	500	\N	246725	PENDING	MIDTRANS
536	73	\N	2025-08-31 18:49:33.16	2025-08-31 18:51:36.681	501	\N	246725	PENDING	MIDTRANS
537	\N	\N	2025-08-31 19:02:32.275	2025-08-31 19:02:32.275	502	\N	246725	PENDING	MIDTRANS
538	\N	\N	2025-09-01 02:55:16.246	2025-09-01 02:55:16.246	503	\N	246675	PENDING	MIDTRANS
539	\N	\N	2025-09-01 03:18:23.203	2025-09-01 03:18:23.203	504	\N	246675	PENDING	MIDTRANS
540	\N	\N	2025-09-01 03:21:19.618	2025-09-01 03:21:19.618	505	\N	246675	PENDING	MIDTRANS
541	\N	\N	2025-09-01 06:31:32.288	2025-09-01 06:31:32.288	506	\N	246675	PENDING	MIDTRANS
542	\N	\N	2025-09-01 07:34:23.988	2025-09-01 07:34:23.988	507	\N	246675	PENDING	MIDTRANS
543	\N	\N	2025-09-01 07:36:16.579	2025-09-01 07:36:16.579	508	\N	246675	PENDING	MIDTRANS
544	\N	\N	2025-09-01 07:36:56.944	2025-09-01 07:36:56.944	509	\N	246675	PENDING	MIDTRANS
545	\N	\N	2025-09-01 08:38:37.544	2025-09-01 08:38:37.544	510	\N	246675	PENDING	MIDTRANS
546	\N	\N	2025-09-01 09:02:47.876	2025-09-01 09:02:47.876	511	\N	246675	PENDING	MIDTRANS
547	\N	\N	2025-09-01 09:05:46.027	2025-09-01 09:05:46.027	512	\N	246675	PENDING	MIDTRANS
548	\N	\N	2025-09-01 09:09:08.901	2025-09-01 09:09:08.901	513	\N	246675	PENDING	MIDTRANS
549	\N	\N	2025-09-01 09:11:51.842	2025-09-01 09:11:51.842	514	\N	246675	PENDING	MIDTRANS
550	\N	\N	2025-09-01 09:12:30.491	2025-09-01 09:12:30.491	515	\N	246675	PENDING	MIDTRANS
551	\N	\N	2025-09-01 09:20:17.059	2025-09-01 09:20:17.059	516	\N	246675	PENDING	MIDTRANS
552	74	\N	2025-09-01 11:17:55.958	2025-09-01 11:20:40.861	517	\N	246675	PENDING	MIDTRANS
553	\N	\N	2025-09-01 11:42:39.454	2025-09-01 11:42:39.454	518	\N	246675	PENDING	MIDTRANS
554	\N	\N	2025-09-01 11:45:07.299	2025-09-01 11:45:07.299	519	\N	246675	PENDING	MIDTRANS
556	\N	\N	2025-09-01 14:17:33.796	2025-09-01 14:17:33.796	521	\N	246675	PENDING	MIDTRANS
555	75	\N	2025-09-01 14:14:17.97	2025-09-01 14:21:16.788	520	\N	246675	PENDING	MIDTRANS
557	\N	\N	2025-09-01 14:22:43.078	2025-09-01 14:22:43.078	522	\N	246675	PENDING	MIDTRANS
558	\N	\N	2025-09-01 17:13:10.602	2025-09-01 17:13:10.602	523	\N	246675	PENDING	MIDTRANS
559	\N	\N	2025-09-01 17:15:19.684	2025-09-01 17:15:19.684	524	\N	246675	PENDING	MIDTRANS
560	\N	\N	2025-09-01 17:27:21.739	2025-09-01 17:27:21.739	525	\N	246675	PENDING	MIDTRANS
561	76	\N	2025-09-01 17:30:14.676	2025-09-01 17:37:01.674	526	\N	246675	PENDING	MIDTRANS
562	\N	\N	2025-09-01 19:16:16.087	2025-09-01 19:16:16.087	527	\N	246675	PENDING	MIDTRANS
563	\N	\N	2025-09-01 23:55:44.476	2025-09-01 23:55:44.476	528	\N	246675	PENDING	MIDTRANS
564	\N	\N	2025-09-02 03:25:14.772	2025-09-02 03:25:14.772	529	\N	246657	PENDING	MIDTRANS
565	\N	\N	2025-09-02 06:20:21.103	2025-09-02 06:20:21.103	530	\N	246657	PENDING	MIDTRANS
566	77	\N	2025-09-02 06:53:02.643	2025-09-02 06:55:28.085	531	\N	246657	PENDING	MIDTRANS
567	\N	\N	2025-09-02 07:45:18.061	2025-09-02 07:45:18.061	532	\N	246657	PENDING	MIDTRANS
568	\N	\N	2025-09-02 07:49:56.892	2025-09-02 07:49:56.892	533	\N	246657	PENDING	MIDTRANS
569	\N	\N	2025-09-02 08:05:10.783	2025-09-02 08:05:10.783	534	\N	246657	PENDING	MIDTRANS
570	\N	\N	2025-09-02 08:06:31.586	2025-09-02 08:06:31.586	535	\N	246657	PENDING	MIDTRANS
571	\N	\N	2025-09-02 08:33:27.578	2025-09-02 08:33:27.578	536	\N	246657	PENDING	MIDTRANS
573	\N	\N	2025-09-02 08:49:25.986	2025-09-02 08:49:25.986	538	\N	246657	PENDING	MIDTRANS
574	79	\N	2025-09-02 09:39:42.139	2025-09-02 09:41:45.355	539	\N	246657	PENDING	MIDTRANS
575	\N	\N	2025-09-02 09:48:36.49	2025-09-02 09:48:36.49	540	\N	246657	PENDING	MIDTRANS
576	\N	\N	2025-09-02 09:50:26.177	2025-09-02 09:50:26.177	541	\N	246657	PENDING	MIDTRANS
572	80	\N	2025-09-02 08:47:32.878	2025-09-02 09:54:51.052	537	\N	246657	PENDING	MIDTRANS
577	81	\N	2025-09-02 09:55:49.105	2025-09-02 09:57:00.769	542	\N	246657	PENDING	MIDTRANS
578	\N	\N	2025-09-02 10:12:02.872	2025-09-02 10:12:02.872	543	\N	246657	PENDING	MIDTRANS
579	82	\N	2025-09-02 10:19:08.79	2025-09-02 10:20:51.271	544	\N	246657	PENDING	MIDTRANS
580	83	\N	2025-09-02 10:51:07.077	2025-09-02 10:52:03.985	545	\N	246657	PENDING	MIDTRANS
581	\N	\N	2025-09-02 11:02:05.007	2025-09-02 11:02:05.007	546	\N	246657	PENDING	MIDTRANS
582	\N	\N	2025-09-02 11:06:48.805	2025-09-02 11:06:48.805	547	\N	246657	PENDING	MIDTRANS
583	\N	\N	2025-09-02 11:11:40.139	2025-09-02 11:11:40.139	548	\N	246657	PENDING	MIDTRANS
584	\N	\N	2025-09-02 11:20:29.923	2025-09-02 11:20:29.923	549	\N	246657	PENDING	MIDTRANS
585	84	2025-09-02 11:30:01.464	2025-09-02 11:30:01.468	2025-09-02 11:30:09.136	\N	141	246657	PAID	PAYPAL
586	85	2025-09-02 11:34:54.316	2025-09-02 11:34:54.317	2025-09-02 11:34:56.873	\N	142	246657	PAID	PAYPAL
587	\N	\N	2025-09-02 11:57:26.386	2025-09-02 11:57:26.386	550	\N	246657	PENDING	MIDTRANS
588	\N	\N	2025-09-02 12:38:53.644	2025-09-02 12:38:53.644	551	\N	246657	PENDING	MIDTRANS
589	86	2025-09-02 13:05:49.471	2025-09-02 13:05:49.476	2025-09-02 13:05:51.141	\N	144	246657	PAID	PAYPAL
590	87	\N	2025-09-02 13:21:23.259	2025-09-02 13:23:31.1	552	\N	246657	PENDING	MIDTRANS
602	\N	\N	2025-09-02 18:56:32.675	2025-09-02 18:56:32.675	563	\N	246657	PENDING	MIDTRANS
591	89	\N	2025-09-02 14:18:50.872	2025-09-02 14:27:08.388	553	\N	246657	PENDING	MIDTRANS
592	\N	\N	2025-09-02 14:49:32.87	2025-09-02 14:49:32.87	554	\N	246657	PENDING	MIDTRANS
593	\N	\N	2025-09-02 14:58:30.868	2025-09-02 14:58:30.868	555	\N	246657	PENDING	MIDTRANS
594	90	2025-09-02 15:18:22.129	2025-09-02 15:18:22.133	2025-09-02 15:18:24.283	\N	146	246657	PAID	PAYPAL
595	\N	\N	2025-09-02 15:40:01.038	2025-09-02 15:40:01.038	556	\N	246657	PENDING	MIDTRANS
596	\N	\N	2025-09-02 16:04:53.477	2025-09-02 16:04:53.477	557	\N	246657	PENDING	MIDTRANS
597	\N	\N	2025-09-02 16:07:13.101	2025-09-02 16:07:13.101	558	\N	246657	PENDING	MIDTRANS
598	\N	\N	2025-09-02 17:05:33.109	2025-09-02 17:05:33.109	559	\N	246657	PENDING	MIDTRANS
599	\N	\N	2025-09-02 17:07:34.795	2025-09-02 17:07:34.795	560	\N	246657	PENDING	MIDTRANS
600	\N	\N	2025-09-02 17:59:44.9	2025-09-02 17:59:44.9	561	\N	246657	PENDING	MIDTRANS
601	\N	\N	2025-09-02 18:13:00.365	2025-09-02 18:13:00.365	562	\N	246657	PENDING	MIDTRANS
603	91	2025-09-02 20:10:00.668	2025-09-02 20:10:00.735	2025-09-02 20:10:26.774	\N	147	246657	PAID	PAYPAL
604	\N	\N	2025-09-02 20:13:33.181	2025-09-02 20:13:33.181	564	\N	246657	PENDING	MIDTRANS
605	92	\N	2025-09-03 04:20:28.177	2025-09-03 04:21:55.334	565	\N	246225	PENDING	MIDTRANS
606	\N	\N	2025-09-03 04:57:04.04	2025-09-03 04:57:04.04	566	\N	246225	PENDING	MIDTRANS
607	93	\N	2025-09-03 05:45:39.49	2025-09-03 05:48:14.224	567	\N	246225	PENDING	MIDTRANS
608	\N	\N	2025-09-03 07:05:04.659	2025-09-03 07:05:04.659	568	\N	246225	PENDING	MIDTRANS
610	\N	2025-09-03 07:59:17.446	2025-09-03 07:59:17.45	2025-09-03 07:59:17.45	\N	152	246225	PAID	PAYPAL
609	96	2025-09-03 07:41:28.677	2025-09-03 07:41:28.76	2025-09-03 07:59:18.279	\N	151	246225	PAID	PAYPAL
611	99	\N	2025-09-03 08:29:42.682	2025-09-03 08:31:26.81	569	\N	246225	PENDING	MIDTRANS
612	100	2025-09-03 09:13:26.445	2025-09-03 09:13:26.452	2025-09-03 09:13:30.034	\N	153	246225	PAID	PAYPAL
613	\N	\N	2025-09-03 09:48:10.14	2025-09-03 09:48:10.14	570	\N	246225	PENDING	MIDTRANS
614	\N	\N	2025-09-03 11:05:28.665	2025-09-03 11:05:28.665	571	\N	246225	PENDING	MIDTRANS
615	\N	\N	2025-09-04 05:58:31.229	2025-09-04 05:58:31.229	572	\N	246082	PENDING	MIDTRANS
673	\N	\N	2025-09-08 02:17:47.288	2025-09-08 02:17:47.288	624	\N	246268	PENDING	MIDTRANS
674	\N	\N	2025-09-08 04:18:44.233	2025-09-08 04:18:44.233	625	\N	246268	PENDING	MIDTRANS
675	\N	\N	2025-09-08 05:02:50.947	2025-09-08 05:02:50.947	626	\N	246268	PENDING	MIDTRANS
676	\N	\N	2025-09-08 07:39:02.515	2025-09-08 07:39:02.515	627	\N	246268	PENDING	MIDTRANS
616	105	\N	2025-09-04 06:10:51.426	2025-09-04 06:29:50.591	573	\N	246082	PENDING	MIDTRANS
617	\N	\N	2025-09-04 09:04:25.31	2025-09-04 09:04:25.31	574	\N	246082	PENDING	MIDTRANS
618	106	\N	2025-09-04 09:48:39.705	2025-09-04 09:53:04.698	575	\N	246082	PENDING	MIDTRANS
619	\N	\N	2025-09-04 11:30:01.015	2025-09-04 11:30:01.015	576	\N	246082	PENDING	MIDTRANS
620	\N	\N	2025-09-04 12:12:23.502	2025-09-04 12:12:23.502	577	\N	246082	PENDING	MIDTRANS
621	\N	\N	2025-09-04 13:05:25.438	2025-09-04 13:05:25.438	578	\N	246082	PENDING	MIDTRANS
622	\N	\N	2025-09-04 13:19:35.35	2025-09-04 13:19:35.35	579	\N	246082	PENDING	MIDTRANS
623	\N	\N	2025-09-04 14:19:46.631	2025-09-04 14:19:46.631	580	\N	246082	PENDING	MIDTRANS
624	\N	\N	2025-09-04 17:30:11.604	2025-09-04 17:30:11.604	581	\N	246082	PENDING	MIDTRANS
625	\N	\N	2025-09-04 20:10:50.182	2025-09-04 20:10:50.182	582	\N	246082	PENDING	MIDTRANS
626	\N	\N	2025-09-04 22:22:52.749	2025-09-04 22:22:52.749	583	\N	246082	PENDING	MIDTRANS
677	\N	\N	2025-09-08 08:04:53.525	2025-09-08 08:04:53.525	628	\N	246268	PENDING	MIDTRANS
627	108	2025-09-05 01:40:54.312	2025-09-05 01:40:54.317	2025-09-05 01:40:57.981	\N	156	246169	PAID	PAYPAL
628	\N	\N	2025-09-05 02:46:24.645	2025-09-05 02:46:24.645	584	\N	246169	PENDING	MIDTRANS
629	\N	\N	2025-09-05 04:53:33.089	2025-09-05 04:53:33.089	585	\N	246169	PENDING	MIDTRANS
630	\N	\N	2025-09-05 04:56:14.617	2025-09-05 04:56:14.617	586	\N	246169	PENDING	MIDTRANS
631	109	\N	2025-09-05 06:06:18.699	2025-09-05 06:08:28.268	587	\N	246169	PENDING	MIDTRANS
632	110	\N	2025-09-05 06:31:36.191	2025-09-05 06:33:17.742	588	\N	246169	PENDING	MIDTRANS
633	\N	\N	2025-09-05 06:39:15.736	2025-09-05 06:39:15.736	589	\N	246169	PENDING	MIDTRANS
634	111	2025-09-05 06:39:51.529	2025-09-05 06:39:51.53	2025-09-05 06:39:52.561	\N	158	246169	PAID	PAYPAL
635	\N	\N	2025-09-05 09:13:57.564	2025-09-05 09:13:57.564	590	\N	246169	PENDING	MIDTRANS
636	\N	\N	2025-09-05 10:22:22.019	2025-09-05 10:22:22.019	591	\N	246169	PENDING	MIDTRANS
637	\N	\N	2025-09-05 10:46:59.418	2025-09-05 10:46:59.418	592	\N	246169	PENDING	MIDTRANS
638	\N	\N	2025-09-05 11:33:39.335	2025-09-05 11:33:39.335	593	\N	246169	PENDING	MIDTRANS
639	\N	\N	2025-09-05 13:10:24.464	2025-09-05 13:10:24.464	594	\N	246169	PENDING	MIDTRANS
640	112	\N	2025-09-05 13:22:43.975	2025-09-05 13:26:11.475	595	\N	246169	PENDING	MIDTRANS
678	\N	\N	2025-09-08 08:07:04.264	2025-09-08 08:07:04.264	629	\N	246268	PENDING	MIDTRANS
641	114	\N	2025-09-05 15:44:53.182	2025-09-05 15:56:08.652	596	\N	246169	PENDING	MIDTRANS
642	\N	\N	2025-09-06 10:00:28.502	2025-09-06 10:00:28.502	597	\N	246356	PENDING	MIDTRANS
643	\N	\N	2025-09-06 10:50:58.821	2025-09-06 10:50:58.821	598	\N	246356	PENDING	MIDTRANS
644	\N	\N	2025-09-06 11:59:03.249	2025-09-06 11:59:03.249	599	\N	246356	PENDING	MIDTRANS
645	\N	\N	2025-09-06 13:42:31.198	2025-09-06 13:42:31.198	600	\N	246356	PENDING	MIDTRANS
646	\N	\N	2025-09-06 16:04:24.734	2025-09-06 16:04:24.734	601	\N	246356	PENDING	MIDTRANS
647	\N	\N	2025-09-06 16:29:13.056	2025-09-06 16:29:13.056	602	\N	246356	PENDING	MIDTRANS
648	\N	\N	2025-09-06 19:32:16.444	2025-09-06 19:32:16.444	603	\N	246356	PENDING	MIDTRANS
649	\N	\N	2025-09-07 02:20:22.675	2025-09-07 02:20:22.675	604	\N	246356	PENDING	MIDTRANS
650	\N	\N	2025-09-07 04:18:47.969	2025-09-07 04:18:47.969	605	\N	246356	PENDING	MIDTRANS
651	\N	\N	2025-09-07 05:03:58.65	2025-09-07 05:03:58.65	606	\N	246356	PENDING	MIDTRANS
652	\N	\N	2025-09-07 05:04:24.484	2025-09-07 05:04:24.484	607	\N	246356	PENDING	MIDTRANS
653	\N	\N	2025-09-07 07:14:20.716	2025-09-07 07:14:20.716	608	\N	246356	PENDING	MIDTRANS
654	\N	\N	2025-09-07 07:35:03.853	2025-09-07 07:35:03.853	609	\N	246356	PENDING	MIDTRANS
655	\N	\N	2025-09-07 07:51:50.801	2025-09-07 07:51:50.801	610	\N	246356	PENDING	MIDTRANS
656	\N	\N	2025-09-07 10:03:43.987	2025-09-07 10:03:43.987	611	\N	246356	PENDING	MIDTRANS
657	\N	\N	2025-09-07 10:16:10.246	2025-09-07 10:16:10.246	612	\N	246356	PENDING	MIDTRANS
658	115	\N	2025-09-07 10:39:32.485	2025-09-07 10:42:31.856	613	\N	246356	PENDING	MIDTRANS
659	116	2025-09-07 11:34:44.075	2025-09-07 11:34:44.077	2025-09-07 11:34:45.815	\N	165	246356	PAID	PAYPAL
660	117	2025-09-07 11:46:36.661	2025-09-07 11:46:36.662	2025-09-07 11:46:37.646	\N	166	246356	PAID	PAYPAL
661	\N	2025-09-07 12:29:41.489	2025-09-07 12:29:41.491	2025-09-07 12:29:41.491	\N	167	246356	PAID	PAYPAL
662	\N	\N	2025-09-07 12:29:41.961	2025-09-07 12:29:41.961	614	\N	246356	PENDING	MIDTRANS
663	\N	\N	2025-09-07 14:30:49.206	2025-09-07 14:30:49.206	615	\N	246356	PENDING	MIDTRANS
664	\N	\N	2025-09-07 15:15:11.179	2025-09-07 15:15:11.179	616	\N	246356	PENDING	MIDTRANS
665	118	\N	2025-09-07 15:15:55.299	2025-09-07 15:17:34.95	617	\N	246356	PENDING	MIDTRANS
666	\N	\N	2025-09-07 15:44:15.864	2025-09-07 15:44:15.864	618	\N	246356	PENDING	MIDTRANS
667	\N	\N	2025-09-07 15:49:20.686	2025-09-07 15:49:20.686	619	\N	246356	PENDING	MIDTRANS
668	\N	\N	2025-09-07 19:09:35.986	2025-09-07 19:09:35.986	620	\N	246356	PENDING	MIDTRANS
669	119	2025-09-07 19:14:14.198	2025-09-07 19:14:14.199	2025-09-07 19:14:16.117	\N	170	246356	PAID	PAYPAL
670	\N	\N	2025-09-07 20:42:49.295	2025-09-07 20:42:49.295	621	\N	246356	PENDING	MIDTRANS
671	\N	\N	2025-09-07 20:58:10.426	2025-09-07 20:58:10.426	622	\N	246356	PENDING	MIDTRANS
672	\N	\N	2025-09-08 02:01:23.925	2025-09-08 02:01:23.925	623	\N	246268	PENDING	MIDTRANS
679	\N	\N	2025-09-08 08:28:17.212	2025-09-08 08:28:17.212	630	\N	246268	PENDING	MIDTRANS
680	\N	\N	2025-09-08 08:30:17.842	2025-09-08 08:30:17.842	631	\N	246268	PENDING	MIDTRANS
681	\N	\N	2025-09-08 09:20:44.948	2025-09-08 09:20:44.948	632	\N	246268	PENDING	MIDTRANS
682	120	2025-09-08 09:35:43.321	2025-09-08 09:35:43.327	2025-09-08 09:35:45.699	\N	171	246268	PAID	PAYPAL
683	\N	\N	2025-09-08 10:34:40.243	2025-09-08 10:34:40.243	633	\N	246268	PENDING	MIDTRANS
684	\N	\N	2025-09-08 10:35:15.982	2025-09-08 10:35:15.982	634	\N	246268	PENDING	MIDTRANS
685	121	\N	2025-09-08 10:40:15.222	2025-09-08 10:41:52.013	635	\N	246268	PENDING	MIDTRANS
686	\N	\N	2025-09-08 11:33:43.173	2025-09-08 11:33:43.173	636	\N	246268	PENDING	MIDTRANS
687	\N	\N	2025-09-08 12:34:44.069	2025-09-08 12:34:44.069	637	\N	246268	PENDING	MIDTRANS
688	\N	\N	2025-09-08 13:27:45.664	2025-09-08 13:27:45.664	638	\N	246268	PENDING	MIDTRANS
689	\N	\N	2025-09-08 15:42:53.442	2025-09-08 15:42:53.442	639	\N	246268	PENDING	MIDTRANS
690	\N	\N	2025-09-08 18:09:24.137	2025-09-08 18:09:24.137	640	\N	246268	PENDING	MIDTRANS
691	\N	\N	2025-09-08 18:32:04.991	2025-09-08 18:32:04.991	641	\N	246268	PENDING	MIDTRANS
692	\N	\N	2025-09-08 19:13:07.913	2025-09-08 19:13:07.913	642	\N	246268	PENDING	MIDTRANS
693	\N	\N	2025-09-08 19:18:06.498	2025-09-08 19:18:06.498	643	\N	246268	PENDING	MIDTRANS
694	123	\N	2025-09-08 19:23:08.394	2025-09-08 19:27:43.34	644	\N	246268	PENDING	MIDTRANS
695	124	\N	2025-09-08 20:05:33.206	2025-09-08 20:11:15.606	645	\N	246268	PENDING	MIDTRANS
696	125	\N	2025-09-09 00:22:11.116	2025-09-09 00:24:35.324	646	\N	246425	PENDING	MIDTRANS
697	\N	2025-09-09 05:02:38.369	2025-09-09 05:02:38.37	2025-09-09 05:02:38.37	\N	173	246425	PAID	PAYPAL
698	\N	\N	2025-09-09 05:02:43.383	2025-09-09 05:02:43.383	647	\N	246425	PENDING	MIDTRANS
699	\N	\N	2025-09-09 06:17:24.591	2025-09-09 06:17:24.591	648	\N	246425	PENDING	MIDTRANS
700	\N	\N	2025-09-09 07:00:02.949	2025-09-09 07:00:02.949	649	\N	246425	PENDING	MIDTRANS
701	\N	\N	2025-09-09 07:13:41.545	2025-09-09 07:13:41.545	650	\N	246425	PENDING	MIDTRANS
702	\N	\N	2025-09-09 08:44:55.518	2025-09-09 08:44:55.518	651	\N	246425	PENDING	MIDTRANS
703	\N	\N	2025-09-09 08:46:52.796	2025-09-09 08:46:52.796	652	\N	246425	PENDING	MIDTRANS
704	\N	\N	2025-09-09 08:56:48.094	2025-09-09 08:56:48.094	653	\N	246425	PENDING	MIDTRANS
752	154	\N	2025-09-12 22:12:40.429	2025-09-12 22:13:59.681	697	\N	246239	PENDING	MIDTRANS
705	128	\N	2025-09-09 09:11:28.678	2025-09-09 09:12:48.34	654	\N	246425	PENDING	MIDTRANS
706	\N	\N	2025-09-09 13:09:34.129	2025-09-09 13:09:34.129	655	\N	246425	PENDING	MIDTRANS
708	\N	\N	2025-09-09 15:15:13.872	2025-09-09 15:15:13.872	657	\N	246425	PENDING	MIDTRANS
707	129	\N	2025-09-09 15:07:10.761	2025-09-09 15:26:22.566	656	\N	246425	PENDING	MIDTRANS
709	\N	\N	2025-09-09 19:06:05.949	2025-09-09 19:06:05.949	658	\N	246425	PENDING	MIDTRANS
710	\N	\N	2025-09-09 19:41:16.946	2025-09-09 19:41:16.946	659	\N	246425	PENDING	MIDTRANS
711	\N	\N	2025-09-09 22:54:29.038	2025-09-09 22:54:29.038	660	\N	246425	PENDING	MIDTRANS
712	\N	\N	2025-09-09 22:57:27.017	2025-09-09 22:57:27.017	661	\N	246425	PENDING	MIDTRANS
713	\N	\N	2025-09-10 04:08:03.487	2025-09-10 04:08:03.487	662	\N	246305	PENDING	MIDTRANS
714	\N	\N	2025-09-10 04:16:45.12	2025-09-10 04:16:45.12	663	\N	246305	PENDING	MIDTRANS
715	\N	\N	2025-09-10 04:33:38.264	2025-09-10 04:33:38.264	664	\N	246305	PENDING	MIDTRANS
716	\N	\N	2025-09-10 07:07:44.901	2025-09-10 07:07:44.901	665	\N	246305	PENDING	MIDTRANS
717	\N	\N	2025-09-10 12:06:12.625	2025-09-10 12:06:12.625	666	\N	246305	PENDING	MIDTRANS
718	\N	\N	2025-09-10 12:10:50.462	2025-09-10 12:10:50.462	667	\N	246305	PENDING	MIDTRANS
719	\N	\N	2025-09-10 13:38:44.89	2025-09-10 13:38:44.89	668	\N	246305	PENDING	MIDTRANS
720	\N	\N	2025-09-10 15:21:21.503	2025-09-10 15:21:21.503	669	\N	246305	PENDING	MIDTRANS
721	\N	\N	2025-09-10 15:26:05.18	2025-09-10 15:26:05.18	670	\N	246305	PENDING	MIDTRANS
722	\N	\N	2025-09-10 15:28:08.862	2025-09-10 15:28:08.862	671	\N	246305	PENDING	MIDTRANS
723	\N	\N	2025-09-10 15:31:21.998	2025-09-10 15:31:21.998	672	\N	246305	PENDING	MIDTRANS
724	\N	\N	2025-09-10 15:41:41.831	2025-09-10 15:41:41.831	673	\N	246305	PENDING	MIDTRANS
725	\N	\N	2025-09-10 16:28:54.451	2025-09-10 16:28:54.451	674	\N	246305	PENDING	MIDTRANS
726	\N	\N	2025-09-10 16:39:28.492	2025-09-10 16:39:28.492	675	\N	246305	PENDING	MIDTRANS
728	\N	\N	2025-09-10 16:54:55.235	2025-09-10 16:54:55.235	677	\N	246305	PENDING	MIDTRANS
727	131	\N	2025-09-10 16:51:04.286	2025-09-10 16:57:13.598	676	\N	246305	PENDING	MIDTRANS
729	\N	\N	2025-09-10 17:27:21.869	2025-09-10 17:27:21.869	678	\N	246305	PENDING	MIDTRANS
730	132	2025-09-10 20:52:01.079	2025-09-10 20:52:01.08	2025-09-10 20:52:09.134	\N	176	246305	PAID	PAYPAL
731	\N	\N	2025-09-11 02:12:00.433	2025-09-11 02:12:00.433	679	\N	246584	PENDING	MIDTRANS
732	\N	\N	2025-09-11 03:22:39.55	2025-09-11 03:22:39.55	680	\N	246584	PENDING	MIDTRANS
733	\N	\N	2025-09-11 05:04:04.905	2025-09-11 05:04:04.905	681	\N	246584	PENDING	MIDTRANS
734	\N	\N	2025-09-11 06:56:46.667	2025-09-11 06:56:46.667	682	\N	246584	PENDING	MIDTRANS
735	\N	\N	2025-09-11 07:30:33.799	2025-09-11 07:30:33.799	683	\N	246584	PENDING	MIDTRANS
736	\N	\N	2025-09-11 07:32:23.321	2025-09-11 07:32:23.321	684	\N	246584	PENDING	MIDTRANS
737	\N	\N	2025-09-11 07:39:39.928	2025-09-11 07:39:39.928	685	\N	246584	PENDING	MIDTRANS
738	133	\N	2025-09-11 08:05:33.833	2025-09-11 08:08:18.57	686	\N	246584	PENDING	MIDTRANS
739	\N	\N	2025-09-11 12:28:15.41	2025-09-11 12:28:15.41	687	\N	246584	PENDING	MIDTRANS
753	155	\N	2025-09-12 22:23:15.751	2025-09-12 22:27:22.211	698	\N	246239	PENDING	MIDTRANS
754	\N	\N	2025-09-12 23:14:15.665	2025-09-12 23:14:15.665	699	\N	246239	PENDING	MIDTRANS
755	\N	\N	2025-09-13 03:31:59.72	2025-09-13 03:31:59.72	700	\N	245452	PENDING	MIDTRANS
740	138	2025-09-11 12:31:36.31	2025-09-11 12:31:36.312	2025-09-11 12:32:25.672	\N	178	246584	PAID	PAYPAL
741	\N	\N	2025-09-11 13:45:16.407	2025-09-11 13:45:16.407	688	\N	246584	PENDING	MIDTRANS
742	\N	\N	2025-09-11 13:46:41.905	2025-09-11 13:46:41.905	689	\N	246584	PENDING	MIDTRANS
774	\N	\N	2025-09-14 06:14:58.155	2025-09-14 06:14:58.155	717	\N	245439	PENDING	MIDTRANS
756	157	2025-09-13 04:04:10.469	2025-09-13 04:04:10.47	2025-09-13 04:04:28.079	\N	184	245452	PAID	PAYPAL
757	\N	\N	2025-09-13 05:16:00.445	2025-09-13 05:16:00.445	701	\N	245452	PENDING	MIDTRANS
758	\N	\N	2025-09-13 06:13:01.51	2025-09-13 06:13:01.51	702	\N	245452	PENDING	MIDTRANS
759	\N	\N	2025-09-13 08:05:33.851	2025-09-13 08:05:33.851	703	\N	245452	PENDING	MIDTRANS
760	\N	\N	2025-09-13 08:10:46.153	2025-09-13 08:10:46.153	704	\N	245452	PENDING	MIDTRANS
761	\N	\N	2025-09-13 08:53:47.949	2025-09-13 08:53:47.949	705	\N	245452	PENDING	MIDTRANS
762	\N	\N	2025-09-13 09:17:06.041	2025-09-13 09:17:06.041	706	\N	245452	PENDING	MIDTRANS
763	\N	\N	2025-09-13 09:23:55.866	2025-09-13 09:23:55.866	707	\N	245452	PENDING	MIDTRANS
743	148	\N	2025-09-11 13:47:32.169	2025-09-11 13:51:30.268	690	\N	246584	PENDING	MIDTRANS
744	149	2025-09-11 15:39:43.122	2025-09-11 15:39:43.123	2025-09-11 15:39:46.743	\N	179	246584	PAID	PAYPAL
745	\N	\N	2025-09-11 16:45:11.346	2025-09-11 16:45:11.346	691	\N	246584	PENDING	MIDTRANS
746	\N	\N	2025-09-11 19:43:01.576	2025-09-11 19:43:01.576	692	\N	246584	PENDING	MIDTRANS
764	158	\N	2025-09-13 10:25:32.349	2025-09-13 10:27:00.1	708	\N	245452	PENDING	MIDTRANS
765	\N	\N	2025-09-13 15:40:58.433	2025-09-13 15:40:58.433	709	\N	245452	PENDING	MIDTRANS
747	153	2025-09-12 05:27:35.916	2025-09-12 05:27:35.92	2025-09-12 05:27:43.87	\N	182	246239	PAID	PAYPAL
748	\N	\N	2025-09-12 13:16:12.272	2025-09-12 13:16:12.272	693	\N	246239	PENDING	MIDTRANS
749	\N	\N	2025-09-12 21:20:14.595	2025-09-12 21:20:14.595	694	\N	246239	PENDING	MIDTRANS
750	\N	\N	2025-09-12 21:59:57.339	2025-09-12 21:59:57.339	695	\N	246239	PENDING	MIDTRANS
751	\N	\N	2025-09-12 22:05:29.954	2025-09-12 22:05:29.954	696	\N	246239	PENDING	MIDTRANS
766	\N	\N	2025-09-13 17:04:38.869	2025-09-13 17:04:38.869	710	\N	245452	PENDING	MIDTRANS
767	\N	\N	2025-09-13 21:45:57.397	2025-09-13 21:45:57.397	711	\N	245452	PENDING	MIDTRANS
768	\N	\N	2025-09-13 23:17:48.97	2025-09-13 23:17:48.97	712	\N	245452	PENDING	MIDTRANS
769	\N	\N	2025-09-14 01:09:50.125	2025-09-14 01:09:50.125	713	\N	245439	PENDING	MIDTRANS
770	\N	\N	2025-09-14 01:16:55.054	2025-09-14 01:16:55.054	714	\N	245439	PENDING	MIDTRANS
772	\N	\N	2025-09-14 04:34:13.406	2025-09-14 04:34:13.406	715	\N	245439	PENDING	MIDTRANS
773	\N	\N	2025-09-14 06:11:37.751	2025-09-14 06:11:37.751	716	\N	245439	PENDING	MIDTRANS
775	\N	\N	2025-09-14 06:19:19.188	2025-09-14 06:19:19.188	718	\N	245439	PENDING	MIDTRANS
776	\N	\N	2025-09-14 08:29:13.9	2025-09-14 08:29:13.9	719	\N	245439	PENDING	MIDTRANS
777	160	2025-09-14 10:09:23.898	2025-09-14 10:09:23.899	2025-09-14 10:09:25.805	\N	188	245439	PAID	PAYPAL
778	\N	\N	2025-09-14 12:11:22.921	2025-09-14 12:11:22.921	720	\N	245439	PENDING	MIDTRANS
779	\N	\N	2025-09-14 12:20:30.028	2025-09-14 12:20:30.028	721	\N	245439	PENDING	MIDTRANS
780	\N	\N	2025-09-14 12:30:02.802	2025-09-14 12:30:02.802	722	\N	245439	PENDING	MIDTRANS
781	\N	\N	2025-09-14 13:44:04.125	2025-09-14 13:44:04.125	723	\N	245439	PENDING	MIDTRANS
782	\N	\N	2025-09-14 15:33:32.909	2025-09-14 15:33:32.909	724	\N	245439	PENDING	MIDTRANS
783	\N	\N	2025-09-14 16:07:09.354	2025-09-14 16:07:09.354	725	\N	245439	PENDING	MIDTRANS
784	\N	\N	2025-09-14 17:35:05.94	2025-09-14 17:35:05.94	726	\N	245439	PENDING	MIDTRANS
785	\N	\N	2025-09-14 22:45:34.817	2025-09-14 22:45:34.817	727	\N	245439	PENDING	MIDTRANS
786	\N	\N	2025-09-15 02:32:36.241	2025-09-15 02:32:36.241	728	\N	245640	PENDING	MIDTRANS
787	\N	\N	2025-09-15 06:42:06.883	2025-09-15 06:42:06.883	729	\N	245640	PENDING	MIDTRANS
788	\N	\N	2025-09-15 08:02:02.012	2025-09-15 08:02:02.012	730	\N	245640	PENDING	MIDTRANS
789	161	2025-09-15 12:31:13.986	2025-09-15 12:31:13.989	2025-09-15 12:31:17.649	\N	196	245640	PAID	PAYPAL
790	\N	\N	2025-09-15 12:51:14.181	2025-09-15 12:51:14.181	731	\N	245640	PENDING	MIDTRANS
791	\N	\N	2025-09-15 13:02:43.77	2025-09-15 13:02:43.77	732	\N	245640	PENDING	MIDTRANS
792	\N	\N	2025-09-15 14:14:58.117	2025-09-15 14:14:58.117	733	\N	245640	PENDING	MIDTRANS
793	\N	\N	2025-09-15 15:56:51.146	2025-09-15 15:56:51.146	734	\N	245640	PENDING	MIDTRANS
794	\N	\N	2025-09-15 17:09:12.202	2025-09-15 17:09:12.202	735	\N	245640	PENDING	MIDTRANS
795	\N	\N	2025-09-16 03:39:13.282	2025-09-16 03:39:13.282	736	\N	245608	PENDING	MIDTRANS
857	\N	\N	2025-09-20 12:56:18.093	2025-09-20 12:56:18.093	793	\N	248291	PENDING	MIDTRANS
858	\N	\N	2025-09-20 14:50:49.141	2025-09-20 14:50:49.141	794	\N	248291	PENDING	MIDTRANS
859	\N	\N	2025-09-20 14:57:51.239	2025-09-20 14:57:51.239	795	\N	248291	PENDING	MIDTRANS
860	\N	\N	2025-09-20 14:59:06.365	2025-09-20 14:59:06.365	796	\N	248291	PENDING	MIDTRANS
796	166	\N	2025-09-16 03:39:45.694	2025-09-16 03:55:31.664	737	\N	245608	PENDING	MIDTRANS
797	\N	\N	2025-09-16 04:16:15.362	2025-09-16 04:16:15.362	738	\N	245608	PENDING	MIDTRANS
798	167	2025-09-16 04:17:27.889	2025-09-16 04:17:27.89	2025-09-16 04:17:30.64	\N	200	245608	PAID	PAYPAL
799	\N	\N	2025-09-16 04:58:50.501	2025-09-16 04:58:50.501	739	\N	245608	PENDING	MIDTRANS
800	\N	\N	2025-09-16 05:44:17.269	2025-09-16 05:44:17.269	740	\N	245608	PENDING	MIDTRANS
801	168	\N	2025-09-16 05:46:48.141	2025-09-16 06:26:22.119	741	\N	245608	PENDING	MIDTRANS
802	\N	\N	2025-09-16 06:36:50.793	2025-09-16 06:36:50.793	742	\N	245608	PENDING	MIDTRANS
803	\N	\N	2025-09-16 06:58:15.855	2025-09-16 06:58:15.855	743	\N	245608	PENDING	MIDTRANS
804	\N	\N	2025-09-16 07:42:14.172	2025-09-16 07:42:14.172	744	\N	245608	PENDING	MIDTRANS
805	\N	\N	2025-09-16 08:17:40.693	2025-09-16 08:17:40.693	745	\N	245608	PENDING	MIDTRANS
806	\N	\N	2025-09-16 08:23:16.168	2025-09-16 08:23:16.168	746	\N	245608	PENDING	MIDTRANS
807	\N	\N	2025-09-16 08:43:49.754	2025-09-16 08:43:49.754	747	\N	245608	PENDING	MIDTRANS
808	\N	\N	2025-09-16 11:05:21.836	2025-09-16 11:05:21.836	748	\N	245608	PENDING	MIDTRANS
809	\N	\N	2025-09-16 13:17:51.337	2025-09-16 13:17:51.337	749	\N	245608	PENDING	MIDTRANS
810	\N	\N	2025-09-16 13:54:22.133	2025-09-16 13:54:22.133	750	\N	245608	PENDING	MIDTRANS
811	\N	\N	2025-09-16 14:33:09.781	2025-09-16 14:33:09.781	751	\N	245608	PENDING	MIDTRANS
812	\N	\N	2025-09-16 16:23:55.601	2025-09-16 16:23:55.601	752	\N	245608	PENDING	MIDTRANS
813	\N	\N	2025-09-16 16:26:09.893	2025-09-16 16:26:09.893	753	\N	245608	PENDING	MIDTRANS
814	\N	\N	2025-09-16 17:17:38.69	2025-09-16 17:17:38.69	754	\N	245608	PENDING	MIDTRANS
815	\N	\N	2025-09-16 20:15:57.061	2025-09-16 20:15:57.061	755	\N	245608	PENDING	MIDTRANS
816	\N	\N	2025-09-16 22:35:24.632	2025-09-16 22:35:24.632	756	\N	245608	PENDING	MIDTRANS
817	\N	\N	2025-09-17 00:47:58.734	2025-09-17 00:47:58.734	757	\N	245592	PENDING	MIDTRANS
818	\N	\N	2025-09-17 03:03:41.463	2025-09-17 03:03:41.463	758	\N	245592	PENDING	MIDTRANS
819	\N	\N	2025-09-17 03:25:30.641	2025-09-17 03:25:30.641	759	\N	245592	PENDING	MIDTRANS
820	\N	\N	2025-09-17 11:58:00.336	2025-09-17 11:58:00.336	760	\N	245592	PENDING	MIDTRANS
821	\N	\N	2025-09-17 12:33:59.602	2025-09-17 12:33:59.602	761	\N	245592	PENDING	MIDTRANS
822	\N	\N	2025-09-17 12:39:26.137	2025-09-17 12:39:26.137	762	\N	245592	PENDING	MIDTRANS
823	\N	\N	2025-09-17 12:58:11.639	2025-09-17 12:58:11.639	763	\N	245592	PENDING	MIDTRANS
824	\N	\N	2025-09-17 13:26:49.613	2025-09-17 13:26:49.613	764	\N	245592	PENDING	MIDTRANS
825	\N	\N	2025-09-17 14:33:58.58	2025-09-17 14:33:58.58	765	\N	245592	PENDING	MIDTRANS
826	\N	\N	2025-09-17 18:06:36.314	2025-09-17 18:06:36.314	766	\N	245592	PENDING	MIDTRANS
827	\N	\N	2025-09-17 18:27:32.11	2025-09-17 18:27:32.11	767	\N	245592	PENDING	MIDTRANS
828	\N	\N	2025-09-17 18:28:55.142	2025-09-17 18:28:55.142	768	\N	245592	PENDING	MIDTRANS
829	\N	\N	2025-09-17 22:31:48.59	2025-09-17 22:31:48.59	769	\N	245592	PENDING	MIDTRANS
830	\N	\N	2025-09-17 23:02:41.579	2025-09-17 23:02:41.579	770	\N	245592	PENDING	MIDTRANS
831	\N	\N	2025-09-17 23:04:30.947	2025-09-17 23:04:30.947	771	\N	245592	PENDING	MIDTRANS
832	\N	\N	2025-09-18 05:29:38.754	2025-09-18 05:29:38.754	772	\N	246144	PENDING	MIDTRANS
833	\N	\N	2025-09-18 13:46:55.861	2025-09-18 13:46:55.861	773	\N	246144	PENDING	MIDTRANS
834	\N	\N	2025-09-18 22:37:24.904	2025-09-18 22:37:24.904	774	\N	246144	PENDING	MIDTRANS
835	\N	\N	2025-09-19 04:32:28.695	2025-09-19 04:32:28.695	775	\N	247077	PENDING	MIDTRANS
836	\N	\N	2025-09-19 07:11:00.282	2025-09-19 07:11:00.282	776	\N	247077	PENDING	MIDTRANS
837	\N	\N	2025-09-19 08:17:26.646	2025-09-19 08:17:26.646	777	\N	247077	PENDING	MIDTRANS
838	\N	\N	2025-09-19 08:26:09.625	2025-09-19 08:26:09.625	778	\N	247077	PENDING	MIDTRANS
839	\N	\N	2025-09-19 08:38:52.19	2025-09-19 08:38:52.19	779	\N	247077	PENDING	MIDTRANS
840	\N	\N	2025-09-19 08:59:10.106	2025-09-19 08:59:10.106	780	\N	247077	PENDING	MIDTRANS
841	\N	\N	2025-09-19 15:21:19.516	2025-09-19 15:21:19.516	781	\N	247077	PENDING	MIDTRANS
842	169	2025-09-19 15:23:01.298	2025-09-19 15:23:01.301	2025-09-19 15:23:04.149	\N	206	247077	PAID	PAYPAL
843	170	2025-09-19 16:15:16.321	2025-09-19 16:15:16.322	2025-09-19 16:15:26.987	\N	207	247077	PAID	PAYPAL
844	171	2025-09-19 16:22:56.342	2025-09-19 16:22:56.344	2025-09-19 16:22:59.319	\N	208	247077	PAID	PAYPAL
845	172	2025-09-19 17:50:22.698	2025-09-19 17:50:22.701	2025-09-19 17:50:31.566	\N	209	247077	PAID	PAYPAL
846	\N	\N	2025-09-19 21:02:20.357	2025-09-19 21:02:20.357	782	\N	247077	PENDING	MIDTRANS
861	\N	\N	2025-09-20 16:16:50.755	2025-09-20 16:16:50.755	797	\N	248291	PENDING	MIDTRANS
848	\N	\N	2025-09-20 02:02:13.341	2025-09-20 02:02:13.341	784	\N	248291	PENDING	MIDTRANS
849	184	\N	2025-09-20 05:05:56.278	2025-09-20 05:25:18.863	785	\N	248291	PENDING	MIDTRANS
862	189	2025-09-21 00:23:13.12	2025-09-21 00:23:13.122	2025-09-21 00:23:14.675	\N	213	248291	PAID	PAYPAL
850	185	\N	2025-09-20 05:49:41.63	2025-09-20 05:51:36.254	786	\N	248291	PENDING	MIDTRANS
851	186	\N	2025-09-20 07:04:14.617	2025-09-20 07:05:33.765	787	\N	248291	PENDING	MIDTRANS
863	\N	\N	2025-09-21 00:54:36.008	2025-09-21 00:54:36.008	798	\N	248291	PENDING	MIDTRANS
852	188	\N	2025-09-20 07:23:05.943	2025-09-20 07:25:27.727	788	\N	248291	PENDING	MIDTRANS
853	\N	\N	2025-09-20 09:07:58.159	2025-09-20 09:07:58.159	789	\N	248291	PENDING	MIDTRANS
854	\N	\N	2025-09-20 09:10:05.846	2025-09-20 09:10:05.846	790	\N	12414549	PENDING	MIDTRANS
855	\N	\N	2025-09-20 09:14:02.428	2025-09-20 09:14:02.428	791	\N	248291	PENDING	MIDTRANS
856	\N	\N	2025-09-20 11:40:24.626	2025-09-20 11:40:24.626	792	\N	248291	PENDING	MIDTRANS
864	\N	\N	2025-09-21 02:28:41.374	2025-09-21 02:28:41.374	799	\N	248291	PENDING	MIDTRANS
865	\N	\N	2025-09-21 02:34:31.083	2025-09-21 02:34:31.083	800	\N	248291	PENDING	MIDTRANS
866	\N	\N	2025-09-21 02:35:47.557	2025-09-21 02:35:47.557	801	\N	248291	PENDING	MIDTRANS
867	\N	\N	2025-09-21 08:28:06.813	2025-09-21 08:28:06.813	802	\N	248291	PENDING	MIDTRANS
868	\N	\N	2025-09-21 08:33:18.568	2025-09-21 08:33:18.568	803	\N	248291	PENDING	MIDTRANS
869	\N	\N	2025-09-21 09:28:54.807	2025-09-21 09:28:54.807	804	\N	248291	PENDING	MIDTRANS
870	\N	\N	2025-09-21 10:45:16.335	2025-09-21 10:45:16.335	805	\N	248291	PENDING	MIDTRANS
871	190	\N	2025-09-21 14:24:04.372	2025-09-21 14:29:59.948	806	\N	248291	PENDING	MIDTRANS
872	\N	\N	2025-09-21 15:53:03.092	2025-09-21 15:53:03.092	807	\N	248291	PENDING	MIDTRANS
873	191	\N	2025-09-21 16:38:53.191	2025-09-21 16:40:30.763	808	\N	248291	PENDING	MIDTRANS
847	\N	\N	2025-09-20 00:39:39.57	2025-09-20 01:10:38.042	783	\N	248291	PENDING	MIDTRANS
875	\N	2025-09-21 17:23:02.441	2025-09-21 17:23:02.442	2025-09-21 17:23:02.442	\N	216	248291	PAID	PAYPAL
874	192	2025-09-21 17:20:15.783	2025-09-21 17:20:15.784	2025-09-21 17:23:03.197	\N	215	248291	PAID	PAYPAL
876	\N	\N	2025-09-21 19:48:19.549	2025-09-21 19:48:19.549	809	\N	248291	PENDING	MIDTRANS
877	\N	\N	2025-09-22 02:08:30.457	2025-09-22 02:08:30.457	810	\N	248468	PENDING	MIDTRANS
878	\N	\N	2025-09-22 04:29:45.425	2025-09-22 04:29:45.425	811	\N	248468	PENDING	MIDTRANS
879	\N	\N	2025-09-22 04:45:42.371	2025-09-22 04:45:42.371	812	\N	248468	PENDING	MIDTRANS
880	\N	\N	2025-09-22 05:26:31.067	2025-09-22 05:26:31.067	813	\N	248468	PENDING	MIDTRANS
881	\N	\N	2025-09-22 06:02:31.448	2025-09-22 06:02:31.448	814	\N	248468	PENDING	MIDTRANS
882	193	\N	2025-09-22 06:55:18.284	2025-09-22 06:56:06.448	815	\N	248468	PENDING	MIDTRANS
883	\N	\N	2025-09-22 07:44:17.884	2025-09-22 07:44:17.884	816	\N	248468	PENDING	MIDTRANS
884	\N	\N	2025-09-22 07:51:45.587	2025-09-22 07:51:45.587	817	\N	248468	PENDING	MIDTRANS
885	\N	\N	2025-09-22 08:12:08.685	2025-09-22 08:12:08.685	818	\N	248468	PENDING	MIDTRANS
886	194	2025-09-22 08:29:51.12	2025-09-22 08:29:51.121	2025-09-22 08:29:56.609	\N	219	248468	PAID	PAYPAL
887	195	\N	2025-09-22 08:37:47.463	2025-09-22 08:40:06.844	819	\N	248468	PENDING	MIDTRANS
888	196	\N	2025-09-22 09:49:44.42	2025-09-22 09:51:54.027	820	\N	248468	PENDING	MIDTRANS
889	\N	\N	2025-09-22 12:24:14.918	2025-09-22 12:24:14.918	821	\N	248468	PENDING	MIDTRANS
890	\N	\N	2025-09-22 12:43:47.482	2025-09-22 12:43:47.482	822	\N	248468	PENDING	MIDTRANS
891	\N	\N	2025-09-22 12:54:52.841	2025-09-22 12:54:52.841	823	\N	248468	PENDING	MIDTRANS
892	\N	\N	2025-09-22 20:06:35.767	2025-09-22 20:06:35.767	824	\N	248468	PENDING	MIDTRANS
893	\N	\N	2025-09-22 20:12:37.895	2025-09-22 20:12:37.895	825	\N	248468	PENDING	MIDTRANS
894	\N	\N	2025-09-22 21:00:24.125	2025-09-22 21:00:24.125	826	\N	248468	PENDING	MIDTRANS
895	\N	\N	2025-09-22 21:02:12.398	2025-09-22 21:02:12.398	827	\N	248468	PENDING	MIDTRANS
896	197	\N	2025-09-23 00:28:50.224	2025-09-23 00:32:09.193	828	\N	248703	PENDING	MIDTRANS
897	\N	\N	2025-09-23 00:44:22.838	2025-09-23 00:44:22.838	829	\N	248703	PENDING	MIDTRANS
898	\N	\N	2025-09-23 02:06:07.169	2025-09-23 02:06:07.169	830	\N	248703	PENDING	MIDTRANS
931	\N	\N	2025-09-23 20:25:11.12	2025-09-23 20:25:11.12	850	\N	248703	PENDING	MIDTRANS
899	199	2025-09-23 02:12:47.275	2025-09-23 02:12:47.276	2025-09-23 02:15:00.325	\N	222	248703	PAID	PAYPAL
900	\N	2025-09-23 02:15:01.458	2025-09-23 02:15:01.459	2025-09-23 02:15:01.459	\N	223	248703	PAID	PAYPAL
932	\N	\N	2025-09-23 22:42:58.853	2025-09-23 22:42:58.853	851	\N	248703	PENDING	MIDTRANS
901	\N	2025-09-23 03:36:07.39	2025-09-23 03:36:07.391	2025-09-23 03:36:09.293	\N	224	248703	PAID	PAYPAL
903	\N	2025-09-23 03:40:11.515	2025-09-23 03:40:11.516	2025-09-23 03:40:11.516	\N	226	248703	PAID	PAYPAL
904	203	2025-09-23 04:55:23.31	2025-09-23 04:55:23.312	2025-09-23 04:55:32.805	\N	228	248703	PAID	PAYPAL
905	204	2025-09-23 07:25:56.246	2025-09-23 07:25:56.247	2025-09-23 07:26:15.046	\N	229	248703	PAID	PAYPAL
906	\N	\N	2025-09-23 07:42:53.09	2025-09-23 07:42:53.09	831	\N	248703	PENDING	MIDTRANS
907	\N	\N	2025-09-23 07:44:46.525	2025-09-23 07:44:46.525	832	\N	248703	PENDING	MIDTRANS
908	205	\N	2025-09-23 07:51:12.115	2025-09-23 07:53:24.52	833	\N	248703	PENDING	MIDTRANS
909	\N	\N	2025-09-23 08:13:56.858	2025-09-23 08:13:56.858	834	\N	248703	PENDING	MIDTRANS
910	\N	\N	2025-09-23 08:15:30.452	2025-09-23 08:15:30.452	835	\N	248703	PENDING	MIDTRANS
911	\N	\N	2025-09-23 08:25:01.067	2025-09-23 08:25:01.067	836	\N	248703	PENDING	MIDTRANS
933	217	2025-09-23 22:47:48.986	2025-09-23 22:47:48.988	2025-09-23 22:47:59.348	\N	238	248703	PAID	PAYPAL
912	208	\N	2025-09-23 08:25:21.474	2025-09-23 08:30:31.255	837	\N	248703	PENDING	MIDTRANS
913	\N	\N	2025-09-23 08:32:01.043	2025-09-23 08:32:01.043	838	\N	248703	PENDING	MIDTRANS
914	\N	\N	2025-09-23 09:18:37.376	2025-09-23 09:18:37.376	839	\N	248703	PENDING	MIDTRANS
916	\N	2025-09-23 10:09:55.786	2025-09-23 10:09:55.787	2025-09-23 10:10:03.037	\N	231	248703	PAID	PAYPAL
902	\N	2025-09-23 03:37:42.471	2025-09-23 03:37:42.48	2025-09-23 03:40:11.041	\N	225	248703	PAID	PAYPAL
915	\N	2025-09-23 10:04:06.234	2025-09-23 10:04:06.235	2025-09-23 10:06:21.193	\N	230	248703	PAID	PAYPAL
918	\N	\N	2025-09-23 12:02:54.814	2025-09-23 12:02:54.814	840	\N	248703	PENDING	MIDTRANS
919	\N	\N	2025-09-23 12:07:08.743	2025-09-23 12:07:08.743	841	\N	248703	PENDING	MIDTRANS
917	\N	2025-09-23 11:42:30.772	2025-09-23 11:42:30.773	2025-09-23 11:42:33.263	\N	233	248703	PAID	PAYPAL
921	\N	\N	2025-09-23 12:20:43.928	2025-09-23 12:20:43.928	842	\N	248703	PENDING	MIDTRANS
920	\N	2025-09-23 12:12:01.106	2025-09-23 12:12:01.107	2025-09-23 12:12:02.831	\N	234	248703	PAID	PAYPAL
922	\N	2025-09-23 12:44:28.365	2025-09-23 12:44:28.366	2025-09-23 12:44:28.998	\N	235	248703	PAID	PAYPAL
924	\N	\N	2025-09-23 16:11:00.505	2025-09-23 16:11:00.505	843	\N	248703	PENDING	MIDTRANS
925	\N	\N	2025-09-23 16:12:03.668	2025-09-23 16:12:03.668	844	\N	248703	PENDING	MIDTRANS
926	\N	\N	2025-09-23 16:31:00.363	2025-09-23 16:31:00.363	845	\N	248703	PENDING	MIDTRANS
927	\N	\N	2025-09-23 17:13:32.361	2025-09-23 17:13:32.361	846	\N	248703	PENDING	MIDTRANS
928	\N	\N	2025-09-23 18:19:18.852	2025-09-23 18:19:18.852	847	\N	248703	PENDING	MIDTRANS
929	216	\N	2025-09-23 18:21:32.939	2025-09-23 18:23:12.466	848	\N	248703	PENDING	MIDTRANS
930	\N	\N	2025-09-23 20:12:39.13	2025-09-23 20:12:39.13	849	\N	248703	PENDING	MIDTRANS
934	218	\N	2025-09-24 00:50:03.424	2025-09-24 00:52:37.552	852	\N	249281	PENDING	MIDTRANS
950	\N	\N	2025-09-24 05:21:57.621	2025-09-24 05:21:57.621	867	\N	249281	PENDING	MIDTRANS
935	220	2025-09-24 01:03:00.548	2025-09-24 01:03:00.549	2025-09-24 01:03:04.914	\N	239	249281	PAID	PAYPAL
936	\N	\N	2025-09-24 01:11:10.832	2025-09-24 01:11:10.832	853	\N	249281	PENDING	MIDTRANS
937	\N	\N	2025-09-24 02:11:28.246	2025-09-24 02:11:28.246	854	\N	249281	PENDING	MIDTRANS
938	\N	\N	2025-09-24 04:03:23.022	2025-09-24 04:03:23.022	855	\N	249281	PENDING	MIDTRANS
939	\N	\N	2025-09-24 04:20:06.972	2025-09-24 04:20:06.972	856	\N	249281	PENDING	MIDTRANS
940	\N	\N	2025-09-24 04:52:16.709	2025-09-24 04:52:16.709	857	\N	249281	PENDING	MIDTRANS
941	\N	\N	2025-09-24 04:53:36.043	2025-09-24 04:53:36.043	858	\N	249281	PENDING	MIDTRANS
942	\N	\N	2025-09-24 04:54:37.228	2025-09-24 04:54:37.228	859	\N	249281	PENDING	MIDTRANS
944	\N	\N	2025-09-24 04:56:30.991	2025-09-24 04:56:30.991	861	\N	249281	PENDING	MIDTRANS
945	\N	\N	2025-09-24 04:57:16.78	2025-09-24 04:57:16.78	862	\N	249281	PENDING	MIDTRANS
943	221	\N	2025-09-24 04:55:17.866	2025-09-24 05:01:09.762	860	\N	249281	PENDING	MIDTRANS
946	\N	\N	2025-09-24 05:07:15.575	2025-09-24 05:07:15.575	863	\N	249281	PENDING	MIDTRANS
947	\N	\N	2025-09-24 05:10:29.814	2025-09-24 05:10:29.814	864	\N	249281	PENDING	MIDTRANS
948	\N	\N	2025-09-24 05:12:30.25	2025-09-24 05:12:30.25	865	\N	249281	PENDING	MIDTRANS
949	\N	\N	2025-09-24 05:12:55.301	2025-09-24 05:12:55.301	866	\N	249281	PENDING	MIDTRANS
952	\N	\N	2025-09-24 05:32:29.311	2025-09-24 05:32:29.311	869	\N	249281	PENDING	MIDTRANS
951	222	\N	2025-09-24 05:30:05.929	2025-09-24 05:32:58.601	868	\N	249281	PENDING	MIDTRANS
953	\N	\N	2025-09-24 05:49:38.792	2025-09-24 05:49:38.792	870	\N	249281	PENDING	MIDTRANS
954	\N	\N	2025-09-24 05:57:56.869	2025-09-24 05:57:56.869	871	\N	249281	PENDING	MIDTRANS
955	\N	\N	2025-09-24 06:06:07.807	2025-09-24 06:06:07.807	872	\N	249281	PENDING	MIDTRANS
956	\N	\N	2025-09-24 06:10:52.538	2025-09-24 06:10:52.538	873	\N	249281	PENDING	MIDTRANS
957	\N	\N	2025-09-24 06:14:43.62	2025-09-24 06:14:43.62	874	\N	249281	PENDING	MIDTRANS
958	\N	\N	2025-09-24 06:33:15.558	2025-09-24 06:33:15.558	875	\N	249281	PENDING	MIDTRANS
959	\N	\N	2025-09-24 06:46:09.219	2025-09-24 06:46:09.219	876	\N	249281	PENDING	MIDTRANS
960	\N	\N	2025-09-24 07:14:55.219	2025-09-24 07:14:55.219	877	\N	249281	PENDING	MIDTRANS
961	\N	\N	2025-09-24 07:23:13.376	2025-09-24 07:23:13.376	878	\N	249281	PENDING	MIDTRANS
962	\N	\N	2025-09-24 07:29:43.803	2025-09-24 07:29:43.803	879	\N	249281	PENDING	MIDTRANS
963	\N	\N	2025-09-24 07:30:57.731	2025-09-24 07:30:57.731	880	\N	249281	PENDING	MIDTRANS
964	\N	\N	2025-09-24 07:31:15.931	2025-09-24 07:31:15.931	881	\N	249281	PENDING	MIDTRANS
965	223	\N	2025-09-24 08:04:41.915	2025-09-24 08:07:18.808	882	\N	249281	PENDING	MIDTRANS
966	\N	\N	2025-09-24 08:19:19.329	2025-09-24 08:19:19.329	883	\N	249281	PENDING	MIDTRANS
967	\N	\N	2025-09-24 08:23:49.916	2025-09-24 08:23:49.916	884	\N	249281	PENDING	MIDTRANS
968	\N	\N	2025-09-24 08:42:19.603	2025-09-24 08:42:19.603	885	\N	249281	PENDING	MIDTRANS
969	\N	\N	2025-09-24 08:50:40.529	2025-09-24 08:50:40.529	886	\N	249281	PENDING	MIDTRANS
970	\N	\N	2025-09-24 08:56:59.86	2025-09-24 08:56:59.86	887	\N	12464060	PENDING	MIDTRANS
971	\N	\N	2025-09-24 09:00:43.32	2025-09-24 09:00:43.32	888	\N	249281	PENDING	MIDTRANS
972	\N	\N	2025-09-24 09:50:45.639	2025-09-24 09:50:45.639	889	\N	249281	PENDING	MIDTRANS
973	\N	\N	2025-09-24 10:13:16.35	2025-09-24 10:13:16.35	890	\N	249281	PENDING	MIDTRANS
974	\N	\N	2025-09-24 10:24:14.567	2025-09-24 10:24:14.567	891	\N	249281	PENDING	MIDTRANS
975	\N	\N	2025-09-24 11:02:57.714	2025-09-24 11:02:57.714	892	\N	249281	PENDING	MIDTRANS
976	\N	\N	2025-09-24 11:12:20.275	2025-09-24 11:12:20.275	893	\N	249281	PENDING	MIDTRANS
977	\N	\N	2025-09-24 11:26:07.445	2025-09-24 11:26:07.445	894	\N	249281	PENDING	MIDTRANS
978	\N	\N	2025-09-24 11:28:30.942	2025-09-24 11:28:30.942	895	\N	249281	PENDING	MIDTRANS
979	\N	\N	2025-09-24 12:02:30.592	2025-09-24 12:02:30.592	896	\N	249281	PENDING	MIDTRANS
980	\N	\N	2025-09-24 12:22:08.884	2025-09-24 12:22:08.884	897	\N	249281	PENDING	MIDTRANS
981	\N	\N	2025-09-24 14:20:02.091	2025-09-24 14:20:02.091	898	\N	249281	PENDING	MIDTRANS
1030	\N	\N	2025-09-25 09:06:09.884	2025-09-25 09:06:09.884	942	\N	249847	PENDING	MIDTRANS
982	225	\N	2025-09-24 14:35:45.757	2025-09-24 14:42:03.111	899	\N	249281	PENDING	MIDTRANS
983	\N	\N	2025-09-24 15:45:44.044	2025-09-24 15:45:44.044	900	\N	249281	PENDING	MIDTRANS
984	\N	\N	2025-09-24 16:09:09.825	2025-09-24 16:09:09.825	901	\N	249281	PENDING	MIDTRANS
985	\N	\N	2025-09-24 16:09:33.929	2025-09-24 16:09:33.929	902	\N	249281	PENDING	MIDTRANS
986	\N	\N	2025-09-24 16:22:16.844	2025-09-24 16:22:16.844	903	\N	249281	PENDING	MIDTRANS
987	\N	\N	2025-09-24 17:02:00.463	2025-09-24 17:02:00.463	904	\N	249281	PENDING	MIDTRANS
988	226	2025-09-24 17:37:06.113	2025-09-24 17:37:06.116	2025-09-24 17:37:13.474	\N	250	249281	PAID	PAYPAL
989	\N	\N	2025-09-24 17:56:31.401	2025-09-24 17:56:31.401	905	\N	249281	PENDING	MIDTRANS
990	\N	\N	2025-09-24 21:22:06.834	2025-09-24 21:22:06.834	906	\N	249281	PENDING	MIDTRANS
991	227	2025-09-24 21:42:37.69	2025-09-24 21:42:37.7	2025-09-24 21:42:39.399	\N	252	249281	PAID	PAYPAL
992	\N	\N	2025-09-24 22:48:55.125	2025-09-24 22:48:55.125	907	\N	249281	PENDING	MIDTRANS
993	\N	\N	2025-09-24 22:54:25.346	2025-09-24 22:54:25.346	908	\N	249281	PENDING	MIDTRANS
994	\N	\N	2025-09-25 00:09:29.904	2025-09-25 00:09:29.904	909	\N	249847	PENDING	MIDTRANS
995	\N	\N	2025-09-25 00:14:15.237	2025-09-25 00:14:15.237	910	\N	249847	PENDING	MIDTRANS
996	228	\N	2025-09-25 00:16:46.37	2025-09-25 00:19:30.303	911	\N	249847	PENDING	MIDTRANS
997	\N	\N	2025-09-25 00:52:19.351	2025-09-25 00:52:19.351	912	\N	249847	PENDING	MIDTRANS
998	\N	\N	2025-09-25 01:56:26.018	2025-09-25 01:56:26.018	913	\N	249847	PENDING	MIDTRANS
999	\N	\N	2025-09-25 02:13:38.483	2025-09-25 02:13:38.483	914	\N	249847	PENDING	MIDTRANS
1000	\N	\N	2025-09-25 02:56:39.43	2025-09-25 02:56:39.43	915	\N	249847	PENDING	MIDTRANS
1001	\N	\N	2025-09-25 02:59:50.466	2025-09-25 02:59:50.466	916	\N	249847	PENDING	MIDTRANS
1002	\N	\N	2025-09-25 03:17:48.191	2025-09-25 03:17:48.191	917	\N	249847	PENDING	MIDTRANS
1003	\N	\N	2025-09-25 03:23:11.302	2025-09-25 03:23:11.302	918	\N	249847	PENDING	MIDTRANS
1004	229	2025-09-25 03:43:19.549	2025-09-25 03:43:19.55	2025-09-25 03:43:26.762	\N	258	249847	PAID	PAYPAL
1005	\N	2025-09-25 03:57:31.151	2025-09-25 03:57:31.152	2025-09-25 03:57:31.152	\N	259	249847	PAID	PAYPAL
1006	\N	\N	2025-09-25 03:57:34.363	2025-09-25 03:57:34.363	919	\N	249847	PENDING	MIDTRANS
1007	\N	\N	2025-09-25 04:16:41.502	2025-09-25 04:16:41.502	920	\N	249847	PENDING	MIDTRANS
1008	230	\N	2025-09-25 04:21:06.443	2025-09-25 04:23:44.32	921	\N	249847	PENDING	MIDTRANS
1009	\N	\N	2025-09-25 04:25:00.045	2025-09-25 04:25:00.045	922	\N	249847	PENDING	MIDTRANS
1010	\N	\N	2025-09-25 04:30:10.867	2025-09-25 04:30:10.867	923	\N	249847	PENDING	MIDTRANS
1011	\N	\N	2025-09-25 04:32:43.706	2025-09-25 04:32:43.706	924	\N	249847	PENDING	MIDTRANS
1012	231	\N	2025-09-25 04:32:57.058	2025-09-25 04:35:35.764	925	\N	249847	PENDING	MIDTRANS
1013	\N	\N	2025-09-25 04:37:04.443	2025-09-25 04:37:04.443	926	\N	249847	PENDING	MIDTRANS
1014	\N	\N	2025-09-25 04:46:33.071	2025-09-25 04:46:33.071	927	\N	12492345	PENDING	MIDTRANS
1015	\N	\N	2025-09-25 04:49:10.997	2025-09-25 04:49:10.997	928	\N	249847	PENDING	MIDTRANS
1016	\N	\N	2025-09-25 04:59:46.695	2025-09-25 04:59:46.695	929	\N	249847	PENDING	MIDTRANS
1017	\N	\N	2025-09-25 05:02:24.081	2025-09-25 05:02:24.081	930	\N	249847	PENDING	MIDTRANS
1018	\N	\N	2025-09-25 05:05:13.07	2025-09-25 05:05:13.07	931	\N	249847	PENDING	MIDTRANS
1020	\N	\N	2025-09-25 05:31:13.081	2025-09-25 05:31:13.081	933	\N	249847	PENDING	MIDTRANS
1019	232	\N	2025-09-25 05:27:31.404	2025-09-25 05:34:43.208	932	\N	249847	PENDING	MIDTRANS
1021	\N	\N	2025-09-25 05:37:15.747	2025-09-25 05:37:15.747	934	\N	249847	PENDING	MIDTRANS
1022	\N	\N	2025-09-25 05:45:08.078	2025-09-25 05:45:08.078	935	\N	249847	PENDING	MIDTRANS
1023	\N	2025-09-25 05:45:49.851	2025-09-25 05:45:49.853	2025-09-25 05:45:49.853	\N	262	249847	PAID	PAYPAL
1024	\N	\N	2025-09-25 05:45:53.684	2025-09-25 05:45:53.684	936	\N	249847	PENDING	MIDTRANS
1025	\N	\N	2025-09-25 06:36:30.756	2025-09-25 06:36:30.756	937	\N	249847	PENDING	MIDTRANS
1031	\N	\N	2025-09-25 09:10:07.451	2025-09-25 09:10:07.451	943	\N	249847	PENDING	MIDTRANS
1026	234	\N	2025-09-25 06:46:21.694	2025-09-25 06:50:14.748	938	\N	249847	PENDING	MIDTRANS
1027	\N	\N	2025-09-25 07:22:00.115	2025-09-25 07:22:00.115	939	\N	249847	PENDING	MIDTRANS
1028	\N	\N	2025-09-25 07:40:36.697	2025-09-25 07:40:36.697	940	\N	249847	PENDING	MIDTRANS
1029	\N	\N	2025-09-25 08:46:21.107	2025-09-25 08:46:21.107	941	\N	249847	PENDING	MIDTRANS
1032	\N	\N	2025-09-25 09:29:05.552	2025-09-25 09:29:05.552	944	\N	249847	PENDING	MIDTRANS
1033	\N	\N	2025-09-25 09:59:49.755	2025-09-25 09:59:49.755	945	\N	249847	PENDING	MIDTRANS
1034	\N	\N	2025-09-25 10:14:28.968	2025-09-25 10:14:28.968	946	\N	249847	PENDING	MIDTRANS
1035	\N	\N	2025-09-25 11:37:36.417	2025-09-25 11:37:36.417	947	\N	249847	PENDING	MIDTRANS
1036	\N	\N	2025-09-25 12:03:19.896	2025-09-25 12:03:19.896	948	\N	249847	PENDING	MIDTRANS
1037	\N	\N	2025-09-25 12:08:10.583	2025-09-25 12:08:10.583	949	\N	249847	PENDING	MIDTRANS
1038	235	\N	2025-09-25 12:11:37.741	2025-09-25 12:17:30.047	950	\N	249847	PENDING	MIDTRANS
1039	236	\N	2025-09-25 12:40:16.074	2025-09-25 12:41:30.661	951	\N	249847	PENDING	MIDTRANS
1040	\N	\N	2025-09-25 13:15:26.421	2025-09-25 13:15:26.421	952	\N	249847	PENDING	MIDTRANS
1041	\N	\N	2025-09-25 15:38:51.066	2025-09-25 15:38:51.066	953	\N	249847	PENDING	MIDTRANS
1043	\N	\N	2025-09-25 16:04:31.416	2025-09-25 16:04:31.416	954	\N	249847	PENDING	MIDTRANS
1042	238	2025-09-25 15:52:32.101	2025-09-25 15:52:32.102	2025-09-25 15:52:37.836	\N	264	249847	PAID	PAYPAL
1044	\N	\N	2025-09-25 16:28:23.85	2025-09-25 16:28:23.85	955	\N	249847	PENDING	MIDTRANS
1045	\N	\N	2025-09-25 17:16:34.239	2025-09-25 17:16:34.239	956	\N	249847	PENDING	MIDTRANS
1046	\N	\N	2025-09-25 17:35:23.002	2025-09-25 17:35:23.002	957	\N	249847	PENDING	MIDTRANS
1047	\N	\N	2025-09-25 17:39:19.459	2025-09-25 17:39:19.459	958	\N	249847	PENDING	MIDTRANS
1048	\N	\N	2025-09-25 18:47:03.458	2025-09-25 18:47:03.458	959	\N	249847	PENDING	MIDTRANS
1049	\N	\N	2025-09-25 18:51:21.615	2025-09-25 18:51:21.615	960	\N	249847	PENDING	MIDTRANS
1050	239	\N	2025-09-25 20:00:22.386	2025-09-25 20:06:24.867	961	\N	249847	PENDING	MIDTRANS
1051	\N	\N	2025-09-25 23:17:28.385	2025-09-25 23:17:28.385	962	\N	249847	PENDING	MIDTRANS
1052	\N	\N	2025-09-25 23:18:22.415	2025-09-25 23:18:22.415	963	\N	249847	PENDING	MIDTRANS
1053	\N	\N	2025-09-25 23:20:18.611	2025-09-25 23:20:18.611	964	\N	249847	PENDING	MIDTRANS
1054	\N	\N	2025-09-26 01:17:51.097	2025-09-26 01:17:51.097	965	\N	251076	PENDING	MIDTRANS
1055	\N	\N	2025-09-26 01:22:12.601	2025-09-26 01:22:12.601	966	\N	251076	PENDING	MIDTRANS
1056	240	2025-09-26 03:06:50.987	2025-09-26 03:06:50.99	2025-09-26 03:06:56.455	\N	266	251076	PAID	PAYPAL
1057	\N	\N	2025-09-26 03:27:08.879	2025-09-26 03:27:08.879	967	\N	251076	PENDING	MIDTRANS
1058	\N	\N	2025-09-26 03:36:36.759	2025-09-26 03:36:36.759	968	\N	251076	PENDING	MIDTRANS
1059	\N	\N	2025-09-26 03:45:40.221	2025-09-26 03:45:40.221	969	\N	251076	PENDING	MIDTRANS
1060	\N	\N	2025-09-26 05:26:28.715	2025-09-26 05:26:28.715	970	\N	251076	PENDING	MIDTRANS
1061	\N	\N	2025-09-26 06:16:54.25	2025-09-26 06:16:54.25	971	\N	251076	PENDING	MIDTRANS
1062	\N	2025-09-26 06:31:32.783	2025-09-26 06:31:32.784	2025-09-26 06:31:32.784	\N	267	251076	PAID	PAYPAL
1063	\N	2025-09-26 06:31:51.113	2025-09-26 06:31:51.114	2025-09-26 06:31:51.114	\N	268	251076	PAID	PAYPAL
1064	\N	\N	2025-09-26 06:31:54.03	2025-09-26 06:31:54.03	972	\N	251076	PENDING	MIDTRANS
1065	\N	\N	2025-09-26 06:45:21.515	2025-09-26 06:45:21.515	973	\N	251076	PENDING	MIDTRANS
1066	\N	\N	2025-09-26 07:12:07.908	2025-09-26 07:12:07.908	974	\N	251076	PENDING	MIDTRANS
1067	\N	\N	2025-09-26 07:33:12.863	2025-09-26 07:33:12.863	975	\N	251076	PENDING	MIDTRANS
1068	241	2025-09-26 07:38:34.131	2025-09-26 07:38:34.133	2025-09-26 07:38:37.722	\N	269	251076	PAID	PAYPAL
1069	\N	\N	2025-09-26 09:05:35.199	2025-09-26 09:05:35.199	976	\N	251076	PENDING	MIDTRANS
1114	\N	\N	2025-09-27 09:42:51.893	2025-09-27 09:42:51.893	1018	\N	251304	PENDING	MIDTRANS
1070	243	2025-09-26 09:20:31.409	2025-09-26 09:20:31.41	2025-09-26 09:22:24.31	\N	270	251076	PAID	PAYPAL
1071	244	\N	2025-09-26 11:08:24.857	2025-09-26 11:09:50.968	977	\N	251076	PENDING	MIDTRANS
1072	\N	\N	2025-09-26 11:49:13.281	2025-09-26 11:49:13.281	978	\N	251076	PENDING	MIDTRANS
1073	245	2025-09-26 12:40:23.015	2025-09-26 12:40:23.016	2025-09-26 12:40:25.601	\N	271	251076	PAID	PAYPAL
1074	\N	\N	2025-09-26 12:56:51.502	2025-09-26 12:56:51.502	979	\N	251076	PENDING	MIDTRANS
1075	\N	\N	2025-09-26 13:01:15.968	2025-09-26 13:01:15.968	980	\N	251076	PENDING	MIDTRANS
1076	247	\N	2025-09-26 13:19:41.702	2025-09-26 13:21:17.69	981	\N	251076	PENDING	MIDTRANS
1077	\N	\N	2025-09-26 13:33:55.033	2025-09-26 13:33:55.033	982	\N	251076	PENDING	MIDTRANS
1078	\N	2025-09-26 13:34:59.416	2025-09-26 13:34:59.417	2025-09-26 13:34:59.417	\N	272	251076	PAID	PAYPAL
1079	\N	\N	2025-09-26 13:39:04.2	2025-09-26 13:39:04.2	983	\N	251076	PENDING	MIDTRANS
1080	\N	\N	2025-09-26 13:48:28.723	2025-09-26 13:48:28.723	984	\N	251076	PENDING	MIDTRANS
1115	255	2025-09-27 10:18:58.313	2025-09-27 10:18:58.316	2025-09-27 10:19:15.799	\N	278	251304	PAID	PAYPAL
1116	\N	\N	2025-09-27 10:41:25.596	2025-09-27 10:41:25.596	1019	\N	251304	PENDING	MIDTRANS
1082	\N	\N	2025-09-26 14:27:56.579	2025-09-26 14:27:56.579	986	\N	251076	PENDING	MIDTRANS
1081	250	\N	2025-09-26 13:59:13.746	2025-09-26 14:33:44.534	985	\N	251076	PENDING	MIDTRANS
1083	\N	\N	2025-09-26 14:34:11.894	2025-09-26 14:34:11.894	987	\N	251076	PENDING	MIDTRANS
1084	251	\N	2025-09-26 14:34:41.608	2025-09-26 14:36:45.67	988	\N	251076	PENDING	MIDTRANS
1085	\N	\N	2025-09-26 14:47:02.422	2025-09-26 14:47:02.422	989	\N	251076	PENDING	MIDTRANS
1086	\N	\N	2025-09-26 16:09:16.496	2025-09-26 16:09:16.496	990	\N	251076	PENDING	MIDTRANS
1087	\N	\N	2025-09-26 16:29:58.665	2025-09-26 16:29:58.665	991	\N	251076	PENDING	MIDTRANS
1088	\N	\N	2025-09-26 16:31:33.56	2025-09-26 16:31:33.56	992	\N	251076	PENDING	MIDTRANS
1089	\N	\N	2025-09-26 17:03:53.572	2025-09-26 17:03:53.572	993	\N	251076	PENDING	MIDTRANS
1090	\N	\N	2025-09-26 17:06:54.912	2025-09-26 17:06:54.912	994	\N	251076	PENDING	MIDTRANS
1091	252	\N	2025-09-26 17:09:33.796	2025-09-26 17:14:08.655	995	\N	251076	PENDING	MIDTRANS
1092	\N	\N	2025-09-26 17:48:42.158	2025-09-26 17:48:42.158	996	\N	251076	PENDING	MIDTRANS
1093	\N	\N	2025-09-26 18:49:09.467	2025-09-26 18:49:09.467	997	\N	251076	PENDING	MIDTRANS
1094	254	\N	2025-09-26 18:51:03.272	2025-09-26 19:13:55.417	998	\N	251076	PENDING	MIDTRANS
1095	\N	\N	2025-09-26 19:30:28.497	2025-09-26 19:30:28.497	999	\N	251076	PENDING	MIDTRANS
1096	\N	\N	2025-09-26 19:31:15.101	2025-09-26 19:31:15.101	1000	\N	251076	PENDING	MIDTRANS
1097	\N	\N	2025-09-27 02:07:04.096	2025-09-27 02:07:04.096	1001	\N	251304	PENDING	MIDTRANS
1098	\N	\N	2025-09-27 02:25:46.836	2025-09-27 02:25:46.836	1002	\N	251304	PENDING	MIDTRANS
1099	\N	\N	2025-09-27 02:30:31.997	2025-09-27 02:30:31.997	1003	\N	251304	PENDING	MIDTRANS
1100	\N	\N	2025-09-27 03:21:04.378	2025-09-27 03:21:04.378	1004	\N	251304	PENDING	MIDTRANS
1101	\N	\N	2025-09-27 03:48:49.744	2025-09-27 03:48:49.744	1005	\N	251304	PENDING	MIDTRANS
1102	\N	\N	2025-09-27 03:54:59.52	2025-09-27 03:54:59.52	1006	\N	251304	PENDING	MIDTRANS
1103	\N	\N	2025-09-27 04:04:16.201	2025-09-27 04:04:16.201	1007	\N	251304	PENDING	MIDTRANS
1104	\N	\N	2025-09-27 05:17:53.248	2025-09-27 05:17:53.248	1008	\N	251304	PENDING	MIDTRANS
1105	\N	\N	2025-09-27 05:37:13.589	2025-09-27 05:37:13.589	1009	\N	251304	PENDING	MIDTRANS
1106	\N	\N	2025-09-27 06:59:50.636	2025-09-27 06:59:50.636	1010	\N	251304	PENDING	MIDTRANS
1107	\N	\N	2025-09-27 07:07:21.666	2025-09-27 07:07:21.666	1011	\N	251304	PENDING	MIDTRANS
1108	\N	\N	2025-09-27 08:25:16.663	2025-09-27 08:25:16.663	1012	\N	251304	PENDING	MIDTRANS
1109	\N	\N	2025-09-27 08:29:49.118	2025-09-27 08:29:49.118	1013	\N	251304	PENDING	MIDTRANS
1110	\N	\N	2025-09-27 08:31:03.367	2025-09-27 08:31:03.367	1014	\N	251304	PENDING	MIDTRANS
1111	\N	\N	2025-09-27 08:40:50.444	2025-09-27 08:40:50.444	1015	\N	251304	PENDING	MIDTRANS
1112	\N	\N	2025-09-27 09:07:37.899	2025-09-27 09:07:37.899	1016	\N	251304	PENDING	MIDTRANS
1113	\N	\N	2025-09-27 09:40:18.622	2025-09-27 09:40:18.622	1017	\N	251304	PENDING	MIDTRANS
1117	256	2025-09-27 11:25:34.676	2025-09-27 11:25:34.677	2025-09-27 11:25:38.255	\N	279	251304	PAID	PAYPAL
1118	\N	\N	2025-09-27 11:40:56.913	2025-09-27 11:40:56.913	1020	\N	251304	PENDING	MIDTRANS
1119	\N	\N	2025-09-27 12:02:51.609	2025-09-27 12:02:51.609	1021	\N	251304	PENDING	MIDTRANS
1120	\N	\N	2025-09-27 12:20:00.637	2025-09-27 12:20:00.637	1022	\N	251304	PENDING	MIDTRANS
1121	\N	\N	2025-09-27 12:22:37.388	2025-09-27 12:22:37.388	1023	\N	251304	PENDING	MIDTRANS
1125	\N	\N	2025-09-27 14:15:45.139	2025-09-27 14:15:45.139	1027	\N	251304	PENDING	MIDTRANS
1126	\N	\N	2025-09-27 14:16:45.687	2025-09-27 14:16:45.687	1028	\N	251304	PENDING	MIDTRANS
1122	259	\N	2025-09-27 13:08:04.421	2025-09-27 13:11:00.267	1024	\N	251304	PENDING	MIDTRANS
1123	\N	\N	2025-09-27 13:27:56.776	2025-09-27 13:27:56.776	1025	\N	251304	PENDING	MIDTRANS
1124	\N	\N	2025-09-27 14:00:46.678	2025-09-27 14:00:46.678	1026	\N	251304	PENDING	MIDTRANS
1127	\N	\N	2025-09-27 14:18:39.971	2025-09-27 14:18:39.971	1029	\N	251304	PENDING	MIDTRANS
1128	\N	2025-09-27 14:29:08.037	2025-09-27 14:29:08.038	2025-09-27 14:29:08.038	\N	282	251304	PAID	PAYPAL
1130	261	2025-09-27 14:35:00.209	2025-09-27 14:35:00.21	2025-09-27 14:35:03.307	\N	284	251304	PAID	PAYPAL
1131	\N	\N	2025-09-27 15:20:16.34	2025-09-27 15:20:16.34	1030	\N	251304	PENDING	MIDTRANS
1132	262	2025-09-27 15:39:01.929	2025-09-27 15:39:01.932	2025-09-27 15:39:06.392	\N	285	251304	PAID	PAYPAL
1133	263	\N	2025-09-27 16:42:26.827	2025-09-27 16:49:15.503	1031	\N	251304	PENDING	MIDTRANS
1134	\N	\N	2025-09-27 17:07:27.586	2025-09-27 17:07:27.586	1032	\N	251304	PENDING	MIDTRANS
1135	\N	\N	2025-09-27 20:27:51.181	2025-09-27 20:27:51.181	1033	\N	251304	PENDING	MIDTRANS
1136	\N	\N	2025-09-27 21:46:30.676	2025-09-27 21:46:30.676	1034	\N	251304	PENDING	MIDTRANS
1129	\N	2025-09-27 14:30:43.103	2025-09-27 14:30:43.104	2025-09-27 14:30:46.691	\N	283	251304	PAID	PAYPAL
1137	265	2025-09-27 21:47:19.501	2025-09-27 21:47:19.503	2025-09-27 21:47:25.632	\N	286	251304	PAID	PAYPAL
1138	\N	\N	2025-09-27 23:55:20.528	2025-09-27 23:55:20.528	1035	\N	251304	PENDING	MIDTRANS
1139	\N	\N	2025-09-28 00:16:51.643	2025-09-28 00:16:51.643	1036	\N	251304	PENDING	MIDTRANS
1140	\N	\N	2025-09-28 01:01:20.024	2025-09-28 01:01:20.024	1037	\N	251304	PENDING	MIDTRANS
1141	\N	\N	2025-09-28 01:08:49.853	2025-09-28 01:08:49.853	1038	\N	251304	PENDING	MIDTRANS
1142	266	2025-09-28 03:17:13.921	2025-09-28 03:17:13.922	2025-09-28 03:17:15.685	\N	287	251304	PAID	PAYPAL
1143	\N	\N	2025-09-28 03:28:35.73	2025-09-28 03:28:35.73	1039	\N	251304	PENDING	MIDTRANS
1144	\N	\N	2025-09-28 03:49:06.8	2025-09-28 03:49:06.8	1040	\N	251304	PENDING	MIDTRANS
1145	\N	\N	2025-09-28 04:00:52.418	2025-09-28 04:00:52.418	1041	\N	251304	PENDING	MIDTRANS
1146	\N	\N	2025-09-28 05:18:08.618	2025-09-28 05:18:08.618	1042	\N	251304	PENDING	MIDTRANS
1147	\N	\N	2025-09-28 05:31:45.392	2025-09-28 05:31:45.392	1043	\N	251304	PENDING	MIDTRANS
1148	267	2025-09-28 05:42:10.062	2025-09-28 05:42:10.063	2025-09-28 05:42:13.429	\N	288	251304	PAID	PAYPAL
1149	268	\N	2025-09-28 05:46:43.929	2025-09-28 05:55:25.208	1044	\N	251304	PENDING	MIDTRANS
1150	\N	\N	2025-09-28 07:08:59.549	2025-09-28 07:08:59.549	1045	\N	251304	PENDING	MIDTRANS
1151	\N	\N	2025-09-28 07:42:20.445	2025-09-28 07:42:20.445	1046	\N	251304	PENDING	MIDTRANS
1152	269	\N	2025-09-28 07:51:05.657	2025-09-28 07:53:15.429	1047	\N	251304	PENDING	MIDTRANS
1153	\N	\N	2025-09-28 08:01:00.734	2025-09-28 08:01:00.734	1048	\N	251304	PENDING	MIDTRANS
1154	\N	\N	2025-09-28 08:37:31.388	2025-09-28 08:37:31.388	1049	\N	251304	PENDING	MIDTRANS
1155	270	\N	2025-09-28 09:25:36.428	2025-09-28 09:34:21.869	1050	\N	251304	PENDING	MIDTRANS
1156	271	\N	2025-09-28 09:34:35.287	2025-09-28 09:37:14.451	1051	\N	251304	PENDING	MIDTRANS
1157	\N	\N	2025-09-28 10:33:14.12	2025-09-28 10:33:14.12	1052	\N	251304	PENDING	MIDTRANS
1158	\N	\N	2025-09-28 10:46:03.378	2025-09-28 10:46:03.378	1053	\N	251304	PENDING	MIDTRANS
1159	\N	\N	2025-09-28 10:50:18.711	2025-09-28 10:50:18.711	1054	\N	251304	PENDING	MIDTRANS
1160	\N	\N	2025-09-28 11:06:03.81	2025-09-28 11:06:03.81	1055	\N	251304	PENDING	MIDTRANS
1161	\N	\N	2025-09-28 12:40:32.484	2025-09-28 12:40:32.484	1056	\N	251304	PENDING	MIDTRANS
1162	\N	\N	2025-09-28 12:59:51.467	2025-09-28 12:59:51.467	1057	\N	251304	PENDING	MIDTRANS
1163	\N	\N	2025-09-28 13:49:26.916	2025-09-28 13:49:26.916	1058	\N	251304	PENDING	MIDTRANS
1164	\N	\N	2025-09-28 14:07:47.183	2025-09-28 14:07:47.183	1059	\N	251304	PENDING	MIDTRANS
1165	\N	\N	2025-09-28 15:02:10.339	2025-09-28 15:02:10.339	1060	\N	251304	PENDING	MIDTRANS
1166	\N	\N	2025-09-28 15:15:51.467	2025-09-28 15:15:51.467	1061	\N	251304	PENDING	MIDTRANS
1167	\N	\N	2025-09-28 15:20:52.549	2025-09-28 15:20:52.549	1062	\N	251304	PENDING	MIDTRANS
1168	\N	\N	2025-09-28 15:36:52.009	2025-09-28 15:36:52.009	1063	\N	251304	PENDING	MIDTRANS
1169	\N	\N	2025-09-28 15:41:04.668	2025-09-28 15:41:04.668	1064	\N	251304	PENDING	MIDTRANS
1170	272	2025-09-28 15:59:32.914	2025-09-28 15:59:32.916	2025-09-28 15:59:38.947	\N	290	251304	PAID	PAYPAL
1171	\N	\N	2025-09-28 16:03:35.412	2025-09-28 16:03:35.412	1065	\N	251304	PENDING	MIDTRANS
1172	\N	\N	2025-09-28 16:04:14.456	2025-09-28 16:04:14.456	1066	\N	251304	PENDING	MIDTRANS
1173	\N	\N	2025-09-28 17:00:14.955	2025-09-28 17:00:14.955	1067	\N	251304	PENDING	MIDTRANS
1202	\N	\N	2025-09-29 05:41:26.133	2025-09-29 05:41:26.133	1094	\N	251262	PENDING	MIDTRANS
1174	274	\N	2025-09-28 17:24:58.362	2025-09-28 17:27:37.386	1068	\N	251304	PENDING	MIDTRANS
1175	\N	\N	2025-09-28 18:08:09.658	2025-09-28 18:08:09.658	1069	\N	251304	PENDING	MIDTRANS
1176	\N	\N	2025-09-28 18:38:41.251	2025-09-28 18:38:41.251	1070	\N	251304	PENDING	MIDTRANS
1177	275	\N	2025-09-28 18:54:48.33	2025-09-28 18:58:27.302	1071	\N	251304	PENDING	MIDTRANS
1178	276	2025-09-28 19:40:53.825	2025-09-28 19:40:53.826	2025-09-28 19:40:56.679	\N	292	251304	PAID	PAYPAL
1179	\N	\N	2025-09-28 19:54:11.049	2025-09-28 19:54:11.049	1072	\N	251304	PENDING	MIDTRANS
1180	\N	\N	2025-09-28 23:29:44.631	2025-09-28 23:29:44.631	1073	\N	251304	PENDING	MIDTRANS
1181	\N	\N	2025-09-29 00:39:58.232	2025-09-29 00:39:58.232	1074	\N	251262	PENDING	MIDTRANS
1182	\N	\N	2025-09-29 01:14:11.72	2025-09-29 01:14:11.72	1075	\N	251262	PENDING	MIDTRANS
1183	\N	\N	2025-09-29 01:16:25.314	2025-09-29 01:16:25.314	1076	\N	251262	PENDING	MIDTRANS
1184	277	\N	2025-09-29 01:19:08.398	2025-09-29 01:36:20.406	1077	\N	251262	PENDING	MIDTRANS
1185	\N	\N	2025-09-29 01:45:03.005	2025-09-29 01:45:03.005	1078	\N	251262	PENDING	MIDTRANS
1186	\N	\N	2025-09-29 01:53:48.406	2025-09-29 01:53:48.406	1079	\N	251262	PENDING	MIDTRANS
1187	\N	\N	2025-09-29 02:23:37.061	2025-09-29 02:23:37.061	1080	\N	251262	PENDING	MIDTRANS
1188	\N	\N	2025-09-29 02:46:52.609	2025-09-29 02:46:52.609	1081	\N	251262	PENDING	MIDTRANS
1189	\N	\N	2025-09-29 02:54:58.704	2025-09-29 02:54:58.704	1082	\N	251262	PENDING	MIDTRANS
1190	\N	\N	2025-09-29 03:19:53.899	2025-09-29 03:19:53.899	1083	\N	251262	PENDING	MIDTRANS
1191	\N	\N	2025-09-29 03:44:47.463	2025-09-29 03:44:47.463	1084	\N	251262	PENDING	MIDTRANS
1192	\N	\N	2025-09-29 03:52:46.441	2025-09-29 03:52:46.441	1085	\N	251262	PENDING	MIDTRANS
1193	\N	\N	2025-09-29 04:20:50.293	2025-09-29 04:20:50.293	1086	\N	251262	PENDING	MIDTRANS
1194	\N	\N	2025-09-29 04:21:23.386	2025-09-29 04:21:23.386	1087	\N	251262	PENDING	MIDTRANS
1195	\N	\N	2025-09-29 04:21:27.792	2025-09-29 04:21:27.792	1088	\N	251262	PENDING	MIDTRANS
1196	\N	\N	2025-09-29 04:21:36.811	2025-09-29 04:21:36.811	1089	\N	251262	PENDING	MIDTRANS
1197	\N	\N	2025-09-29 04:49:58.059	2025-09-29 04:49:58.059	1090	\N	251262	PENDING	MIDTRANS
1199	\N	2025-09-29 05:26:22.164	2025-09-29 05:26:22.167	2025-09-29 05:26:22.167	\N	295	251262	PAID	PAYPAL
1198	278	\N	2025-09-29 05:24:17.324	2025-09-29 05:26:31.955	1091	\N	251262	PENDING	MIDTRANS
1201	279	\N	2025-09-29 05:38:25.544	2025-09-29 05:40:25.894	1093	\N	251262	PENDING	MIDTRANS
1203	\N	\N	2025-09-29 05:42:56.562	2025-09-29 05:42:56.562	1095	\N	251262	PENDING	MIDTRANS
1204	\N	\N	2025-09-29 06:17:10.337	2025-09-29 06:17:10.337	1096	\N	251262	PENDING	MIDTRANS
1205	\N	\N	2025-09-29 06:20:58.225	2025-09-29 06:20:58.225	1097	\N	251262	PENDING	MIDTRANS
1206	\N	\N	2025-09-29 06:48:04.005	2025-09-29 06:48:04.005	1098	\N	251262	PENDING	MIDTRANS
1207	\N	\N	2025-09-29 07:24:59.499	2025-09-29 07:24:59.499	1099	\N	251262	PENDING	MIDTRANS
1208	280	\N	2025-09-29 07:41:02.501	2025-09-29 07:44:21.044	1100	\N	251262	PENDING	MIDTRANS
1209	\N	\N	2025-09-29 07:49:05.321	2025-09-29 07:49:05.321	1101	\N	251262	PENDING	MIDTRANS
1200	281	\N	2025-09-29 05:35:31.853	2025-09-29 07:52:20.234	1092	\N	251262	PENDING	MIDTRANS
1210	282	\N	2025-09-29 08:45:50.897	2025-09-29 08:47:56.445	1102	\N	251262	PENDING	MIDTRANS
1211	\N	\N	2025-09-29 09:29:45.64	2025-09-29 09:29:45.64	1103	\N	251262	PENDING	MIDTRANS
1212	\N	\N	2025-09-29 09:31:37.797	2025-09-29 09:31:37.797	1104	\N	251262	PENDING	MIDTRANS
1213	\N	\N	2025-09-29 09:32:12.265	2025-09-29 09:32:12.265	1105	\N	251262	PENDING	MIDTRANS
1214	\N	\N	2025-09-29 09:37:38.471	2025-09-29 09:37:38.471	1106	\N	251262	PENDING	MIDTRANS
1215	\N	\N	2025-09-29 09:46:35.149	2025-09-29 09:46:35.149	1107	\N	251262	PENDING	MIDTRANS
1217	\N	\N	2025-09-29 10:06:55.351	2025-09-29 10:06:55.351	1109	\N	251262	PENDING	MIDTRANS
1216	284	\N	2025-09-29 09:55:45.732	2025-09-29 10:02:01.77	1108	\N	251262	PENDING	MIDTRANS
1219	\N	\N	2025-09-29 10:20:27.793	2025-09-29 10:20:27.793	1110	\N	251262	PENDING	MIDTRANS
1220	\N	\N	2025-09-29 10:27:10.025	2025-09-29 10:27:10.025	1111	\N	251262	PENDING	MIDTRANS
1221	\N	\N	2025-09-29 10:44:26.451	2025-09-29 10:44:26.451	1112	\N	251262	PENDING	MIDTRANS
1222	\N	\N	2025-09-29 10:47:35.345	2025-09-29 10:47:35.345	1113	\N	251262	PENDING	MIDTRANS
1223	\N	\N	2025-09-29 11:00:43.098	2025-09-29 11:00:43.098	1114	\N	251262	PENDING	MIDTRANS
1224	\N	\N	2025-09-29 11:04:05.55	2025-09-29 11:04:05.55	1115	\N	251262	PENDING	MIDTRANS
1225	286	\N	2025-09-29 11:15:02.449	2025-09-29 11:17:54.291	1116	\N	251262	PENDING	MIDTRANS
1226	\N	\N	2025-09-29 11:20:38.955	2025-09-29 11:20:38.955	1117	\N	251262	PENDING	MIDTRANS
1227	\N	\N	2025-09-29 11:21:57.674	2025-09-29 11:21:57.674	1118	\N	251262	PENDING	MIDTRANS
1228	287	2025-09-29 11:27:01.453	2025-09-29 11:27:01.454	2025-09-29 11:27:01.592	\N	297	251262	PAID	PAYPAL
1229	\N	\N	2025-09-29 11:41:06.941	2025-09-29 11:41:06.941	1119	\N	251262	PENDING	MIDTRANS
1230	\N	\N	2025-09-29 11:49:24.538	2025-09-29 11:49:24.538	1120	\N	251262	PENDING	MIDTRANS
1231	\N	\N	2025-09-29 11:51:18.329	2025-09-29 11:51:18.329	1121	\N	251262	PENDING	MIDTRANS
1235	\N	\N	2025-09-29 12:40:09.777	2025-09-29 12:40:09.777	1125	\N	251262	PENDING	MIDTRANS
1234	288	\N	2025-09-29 12:24:47.957	2025-09-29 13:02:26.203	1124	\N	251262	PENDING	MIDTRANS
1237	289	\N	2025-09-29 13:29:07.773	2025-09-29 13:30:35.445	1127	\N	251262	PENDING	MIDTRANS
1238	\N	\N	2025-09-29 13:30:39.351	2025-09-29 13:30:39.351	1128	\N	251262	PENDING	MIDTRANS
1240	\N	\N	2025-09-29 13:57:29.136	2025-09-29 13:57:29.136	1130	\N	251262	PENDING	MIDTRANS
1239	290	\N	2025-09-29 13:56:10.309	2025-09-29 13:58:02.876	1129	\N	251262	PENDING	MIDTRANS
1241	\N	\N	2025-09-29 14:21:28.82	2025-09-29 14:21:28.82	1131	\N	251262	PENDING	MIDTRANS
1242	\N	\N	2025-09-29 14:22:14.221	2025-09-29 14:22:14.221	1132	\N	251262	PENDING	MIDTRANS
1243	\N	\N	2025-09-29 14:28:20.538	2025-09-29 14:28:20.538	1133	\N	251262	PENDING	MIDTRANS
1244	\N	\N	2025-09-29 14:36:34.414	2025-09-29 14:36:34.414	1134	\N	251262	PENDING	MIDTRANS
1245	\N	\N	2025-09-29 14:57:12.609	2025-09-29 14:57:12.609	1135	\N	251262	PENDING	MIDTRANS
1246	\N	\N	2025-09-29 15:02:29.864	2025-09-29 15:02:29.864	1136	\N	251262	PENDING	MIDTRANS
1247	\N	\N	2025-09-29 15:17:10.923	2025-09-29 15:17:10.923	1137	\N	251262	PENDING	MIDTRANS
1248	\N	\N	2025-09-29 15:21:05.659	2025-09-29 15:21:05.659	1138	\N	251262	PENDING	MIDTRANS
1249	291	\N	2025-09-29 15:22:20.708	2025-09-29 15:24:40.449	1139	\N	251262	PENDING	MIDTRANS
1250	\N	\N	2025-09-29 15:27:59.32	2025-09-29 15:27:59.32	1140	\N	251262	PENDING	MIDTRANS
1251	\N	\N	2025-09-29 15:32:22.008	2025-09-29 15:32:22.008	1141	\N	251262	PENDING	MIDTRANS
1252	292	2025-09-29 15:39:07.672	2025-09-29 15:39:07.673	2025-09-29 15:39:42.629	\N	299	251262	PAID	PAYPAL
1253	\N	\N	2025-09-29 15:48:52.39	2025-09-29 15:48:52.39	1142	\N	251262	PENDING	MIDTRANS
1254	\N	\N	2025-09-29 15:53:43.25	2025-09-29 15:53:43.25	1143	\N	251262	PENDING	MIDTRANS
1255	293	2025-09-29 16:08:18.564	2025-09-29 16:08:18.565	2025-09-29 16:10:48.263	\N	301	251262	PAID	PAYPAL
1256	\N	\N	2025-09-29 16:22:23.992	2025-09-29 16:22:23.992	1144	\N	251262	PENDING	MIDTRANS
1257	\N	\N	2025-09-29 16:24:14.168	2025-09-29 16:24:14.168	1145	\N	251262	PENDING	MIDTRANS
1258	\N	\N	2025-09-29 16:25:46.824	2025-09-29 16:25:46.824	1146	\N	251262	PENDING	MIDTRANS
1259	\N	\N	2025-09-29 16:26:35.814	2025-09-29 16:26:35.814	1147	\N	251262	PENDING	MIDTRANS
1260	294	\N	2025-09-29 16:48:21.764	2025-09-29 16:51:23.439	1148	\N	251262	PENDING	MIDTRANS
1261	\N	\N	2025-09-29 17:08:51.548	2025-09-29 17:08:51.548	1149	\N	251262	PENDING	MIDTRANS
1283	\N	\N	2025-09-30 03:14:14.437	2025-09-30 03:14:14.437	1166	\N	249840	PENDING	MIDTRANS
1264	\N	\N	2025-09-29 18:10:56.074	2025-09-29 18:10:56.074	1151	\N	251262	PENDING	MIDTRANS
1263	295	2025-09-29 17:59:05.489	2025-09-29 17:59:05.493	2025-09-29 17:59:19.024	\N	302	251262	PAID	PAYPAL
1262	\N	\N	2025-09-29 17:58:57.263	2025-09-29 17:58:57.263	1150	\N	251262	PENDING	MIDTRANS
1284	\N	\N	2025-09-30 03:16:07.243	2025-09-30 03:16:07.243	1167	\N	249840	PENDING	MIDTRANS
1271	\N	\N	2025-09-29 21:32:43.928	2025-09-29 21:32:43.928	1157	\N	251262	PENDING	MIDTRANS
1270	\N	\N	2025-09-29 20:34:29.822	2025-09-29 20:34:29.822	1156	\N	251262	PENDING	MIDTRANS
1269	\N	\N	2025-09-29 20:16:44.113	2025-09-29 20:16:44.113	1155	\N	251262	PENDING	MIDTRANS
1268	\N	\N	2025-09-29 20:14:51.377	2025-09-29 20:14:51.377	1154	\N	251262	PENDING	MIDTRANS
1267	\N	\N	2025-09-29 19:59:20.364	2025-09-29 19:59:20.364	1153	\N	251262	PENDING	MIDTRANS
1266	296	2025-09-29 19:51:44.02	2025-09-29 19:51:44.021	2025-09-29 19:51:46.253	\N	303	251262	PAID	PAYPAL
1265	\N	\N	2025-09-29 19:41:46.474	2025-09-29 19:41:46.474	1152	\N	251262	PENDING	MIDTRANS
1218	\N	2025-09-29 10:17:51.092	2025-09-29 10:17:51.093	2025-09-29 10:18:01.765	\N	296	251262	PAID	PAYPAL
1272	\N	\N	2025-09-29 22:27:33.927	2025-09-29 22:27:33.927	1158	\N	251262	PENDING	MIDTRANS
923	\N	2025-09-23 13:17:50.178	2025-09-23 13:17:50.179	2025-09-23 13:17:52.406	\N	236	248703	PAID	PAYPAL
1273	\N	\N	2025-09-29 22:29:35.629	2025-09-29 22:29:35.629	1159	\N	251262	PENDING	MIDTRANS
771	\N	2025-09-14 01:17:26.468	2025-09-14 01:17:26.471	2025-09-14 01:17:51.712	\N	186	245439	PAID	PAYPAL
1274	\N	\N	2025-09-30 01:05:53.655	2025-09-30 01:05:53.655	1160	\N	249840	PENDING	MIDTRANS
1275	\N	\N	2025-09-30 01:39:45.382	2025-09-30 01:39:45.382	1161	\N	249840	PENDING	MIDTRANS
1276	\N	\N	2025-09-30 01:46:51.497	2025-09-30 01:46:51.497	1162	\N	249840	PENDING	MIDTRANS
1277	\N	\N	2025-09-30 01:56:21.618	2025-09-30 01:56:21.618	1163	\N	249840	PENDING	MIDTRANS
1278	297	2025-09-30 01:56:28.137	2025-09-30 01:56:28.138	2025-09-30 01:56:31.886	\N	305	249840	PAID	PAYPAL
1279	298	2025-09-30 01:59:27.404	2025-09-30 01:59:27.405	2025-09-30 01:59:31.017	\N	306	249840	PAID	PAYPAL
1281	\N	\N	2025-09-30 02:01:27.284	2025-09-30 02:01:27.284	1165	\N	249840	PENDING	MIDTRANS
1280	299	\N	2025-09-30 02:01:02.685	2025-09-30 02:03:15.257	1164	\N	249840	PENDING	MIDTRANS
1282	300	2025-09-30 02:03:20.253	2025-09-30 02:03:20.254	2025-09-30 02:03:22.419	\N	307	249840	PAID	PAYPAL
1285	\N	\N	2025-09-30 03:25:19.99	2025-09-30 03:25:19.99	1168	\N	249840	PENDING	MIDTRANS
1286	\N	\N	2025-09-30 03:27:04.225	2025-09-30 03:27:04.225	1169	\N	249840	PENDING	MIDTRANS
1287	\N	\N	2025-09-30 03:39:45.563	2025-09-30 03:39:45.563	1170	\N	249840	PENDING	MIDTRANS
1288	\N	\N	2025-09-30 03:40:56.954	2025-09-30 03:40:56.954	1171	\N	249840	PENDING	MIDTRANS
1289	\N	\N	2025-09-30 03:54:19.934	2025-09-30 03:54:19.934	1172	\N	249840	PENDING	MIDTRANS
1290	\N	\N	2025-09-30 04:20:34.897	2025-09-30 04:20:34.897	1173	\N	249840	PENDING	MIDTRANS
1291	\N	\N	2025-09-30 04:21:03.828	2025-09-30 04:21:03.828	1174	\N	249840	PENDING	MIDTRANS
1292	\N	\N	2025-09-30 04:31:58.209	2025-09-30 04:31:58.209	1175	\N	249840	PENDING	MIDTRANS
1293	\N	\N	2025-09-30 04:43:41.6	2025-09-30 04:43:41.6	1176	\N	249840	PENDING	MIDTRANS
1294	\N	\N	2025-09-30 04:45:08.461	2025-09-30 04:45:08.461	1177	\N	249840	PENDING	MIDTRANS
1295	\N	\N	2025-09-30 04:47:55.793	2025-09-30 04:47:55.793	1178	\N	249840	PENDING	MIDTRANS
1296	\N	\N	2025-09-30 04:57:40.802	2025-09-30 04:57:40.802	1179	\N	249840	PENDING	MIDTRANS
1297	\N	\N	2025-09-30 05:00:29.92	2025-09-30 05:00:29.92	1180	\N	249840	PENDING	MIDTRANS
1298	\N	\N	2025-09-30 05:01:46.309	2025-09-30 05:01:46.309	1181	\N	249840	PENDING	MIDTRANS
1299	301	\N	2025-09-30 05:03:57.579	2025-09-30 05:05:36.752	1182	\N	249840	PENDING	MIDTRANS
1300	\N	\N	2025-09-30 05:08:04.103	2025-09-30 05:08:04.103	1183	\N	249840	PENDING	MIDTRANS
1301	\N	\N	2025-09-30 05:10:23.779	2025-09-30 05:10:23.779	1184	\N	249840	PENDING	MIDTRANS
1302	\N	\N	2025-09-30 05:23:10.552	2025-09-30 05:23:10.552	1185	\N	249840	PENDING	MIDTRANS
1304	\N	\N	2025-09-30 05:51:46.103	2025-09-30 05:51:46.103	1187	\N	249840	PENDING	MIDTRANS
1303	302	\N	2025-09-30 05:46:50.414	2025-09-30 05:54:35.279	1186	\N	249840	PENDING	MIDTRANS
1305	\N	\N	2025-09-30 05:56:37.787	2025-09-30 05:56:37.787	1188	\N	249840	PENDING	MIDTRANS
1306	303	2025-09-30 06:00:31.897	2025-09-30 06:00:31.898	2025-09-30 06:00:33.587	\N	308	249840	PAID	PAYPAL
1307	\N	\N	2025-09-30 06:08:04.206	2025-09-30 06:08:04.206	1189	\N	249840	PENDING	MIDTRANS
1308	\N	\N	2025-09-30 06:27:13.967	2025-09-30 06:27:13.967	1190	\N	249840	PENDING	MIDTRANS
1309	\N	\N	2025-09-30 06:47:56.27	2025-09-30 06:47:56.27	1191	\N	249840	PENDING	MIDTRANS
1310	\N	\N	2025-09-30 07:03:12.727	2025-09-30 07:03:12.727	1192	\N	249840	PENDING	MIDTRANS
1311	\N	\N	2025-09-30 07:20:19.612	2025-09-30 07:20:19.612	1193	\N	249840	PENDING	MIDTRANS
1312	\N	\N	2025-09-30 07:32:37.147	2025-09-30 07:32:37.147	1194	\N	249840	PENDING	MIDTRANS
1366	327	\N	2025-09-30 14:23:31.722	2025-09-30 14:25:33.5	1237	\N	249840	PENDING	MIDTRANS
1314	\N	\N	2025-09-30 08:07:14.235	2025-09-30 08:07:14.235	1195	\N	249840	PENDING	MIDTRANS
1315	\N	\N	2025-09-30 08:10:43.452	2025-09-30 08:10:43.452	1196	\N	249840	PENDING	MIDTRANS
1316	\N	\N	2025-09-30 08:11:49.317	2025-09-30 08:11:49.317	1197	\N	249840	PENDING	MIDTRANS
1317	305	\N	2025-09-30 08:19:30.747	2025-09-30 08:21:29.486	1198	\N	249840	PENDING	MIDTRANS
1319	\N	\N	2025-09-30 08:30:58.686	2025-09-30 08:30:58.686	1200	\N	249840	PENDING	MIDTRANS
1318	306	\N	2025-09-30 08:26:21.421	2025-09-30 08:32:51.452	1199	\N	249840	PENDING	MIDTRANS
1313	307	2025-09-30 07:51:22.368	2025-09-30 07:51:22.369	2025-09-30 08:34:21.357	\N	309	249840	PAID	PAYPAL
1320	\N	2025-09-30 08:34:21.877	2025-09-30 08:34:21.878	2025-09-30 08:34:21.878	\N	310	249840	PAID	PAYPAL
1321	308	\N	2025-09-30 08:52:57.877	2025-09-30 08:57:00.276	1201	\N	249840	PENDING	MIDTRANS
1322	\N	\N	2025-09-30 09:26:50.467	2025-09-30 09:26:50.467	1202	\N	249840	PENDING	MIDTRANS
1324	\N	2025-09-30 09:37:01.717	2025-09-30 09:37:01.725	2025-09-30 09:37:01.725	\N	313	249840	PAID	PAYPAL
1325	309	2025-09-30 09:37:25.302	2025-09-30 09:37:25.303	2025-09-30 09:37:32.833	\N	314	249840	PAID	PAYPAL
1326	310	\N	2025-09-30 09:37:55.931	2025-09-30 09:39:46.969	1204	\N	249840	PENDING	MIDTRANS
1327	\N	\N	2025-09-30 09:50:25.316	2025-09-30 09:50:25.316	1205	\N	249840	PENDING	MIDTRANS
1328	\N	\N	2025-09-30 09:51:33.382	2025-09-30 09:51:33.382	1206	\N	249840	PENDING	MIDTRANS
1329	311	2025-09-30 09:51:50.024	2025-09-30 09:51:50.025	2025-09-30 09:52:04.279	\N	315	249840	PAID	PAYPAL
1323	312	\N	2025-09-30 09:32:08.017	2025-09-30 09:54:35.137	1203	\N	249840	PENDING	MIDTRANS
1330	\N	\N	2025-09-30 09:57:46.931	2025-09-30 09:57:46.931	1207	\N	249840	PENDING	MIDTRANS
1331	313	\N	2025-09-30 10:01:38.487	2025-09-30 10:03:53.437	1208	\N	249840	PENDING	MIDTRANS
1332	314	\N	2025-09-30 10:13:18.849	2025-09-30 10:15:20.586	1209	\N	249840	PENDING	MIDTRANS
1333	\N	\N	2025-09-30 10:18:15.529	2025-09-30 10:18:15.529	1210	\N	249840	PENDING	MIDTRANS
1334	\N	\N	2025-09-30 10:18:20.343	2025-09-30 10:18:20.343	1211	\N	249840	PENDING	MIDTRANS
1335	\N	\N	2025-09-30 10:18:59.538	2025-09-30 10:18:59.538	1212	\N	249840	PENDING	MIDTRANS
1336	\N	\N	2025-09-30 10:27:32.801	2025-09-30 10:27:32.801	1213	\N	249840	PENDING	MIDTRANS
1337	\N	\N	2025-09-30 10:32:18.134	2025-09-30 10:32:18.134	1214	\N	249840	PENDING	MIDTRANS
1338	\N	\N	2025-09-30 10:44:46.294	2025-09-30 10:44:46.294	1215	\N	249840	PENDING	MIDTRANS
1339	\N	\N	2025-09-30 10:55:45.454	2025-09-30 10:55:45.454	1216	\N	249840	PENDING	MIDTRANS
1340	\N	\N	2025-09-30 10:59:48.014	2025-09-30 10:59:48.014	1217	\N	249840	PENDING	MIDTRANS
1341	315	\N	2025-09-30 11:31:16.014	2025-09-30 11:33:32.911	1218	\N	249840	PENDING	MIDTRANS
1342	\N	\N	2025-09-30 11:36:01.689	2025-09-30 11:36:01.689	1219	\N	249840	PENDING	MIDTRANS
1343	\N	\N	2025-09-30 11:38:48.859	2025-09-30 11:38:48.859	1220	\N	249840	PENDING	MIDTRANS
1344	316	\N	2025-09-30 11:50:50.568	2025-09-30 11:53:28.72	1221	\N	249840	PENDING	MIDTRANS
1345	317	2025-09-30 12:31:01.993	2025-09-30 12:31:01.994	2025-09-30 12:31:04.091	\N	316	249840	PAID	PAYPAL
1346	\N	\N	2025-09-30 12:36:33.654	2025-09-30 12:36:33.654	1222	\N	249840	PENDING	MIDTRANS
1347	\N	\N	2025-09-30 12:37:10.683	2025-09-30 12:37:10.683	1223	\N	249840	PENDING	MIDTRANS
1348	\N	\N	2025-09-30 12:37:39.564	2025-09-30 12:37:39.564	1224	\N	249840	PENDING	MIDTRANS
1349	\N	\N	2025-09-30 12:38:17.558	2025-09-30 12:38:17.558	1225	\N	249840	PENDING	MIDTRANS
1351	\N	2025-09-30 12:40:50.469	2025-09-30 12:40:50.471	2025-09-30 12:40:50.471	\N	317	249840	PAID	PAYPAL
1350	318	\N	2025-09-30 12:39:52.48	2025-09-30 12:40:59.409	1226	\N	249840	PENDING	MIDTRANS
1352	319	2025-09-30 12:41:37.765	2025-09-30 12:41:37.766	2025-09-30 12:41:39.692	\N	318	249840	PAID	PAYPAL
1353	\N	\N	2025-09-30 12:44:30.81	2025-09-30 12:44:30.81	1227	\N	249840	PENDING	MIDTRANS
1354	320	2025-09-30 12:48:01.845	2025-09-30 12:48:01.849	2025-09-30 12:48:06.552	\N	319	249840	PAID	PAYPAL
1355	\N	\N	2025-09-30 12:50:21.214	2025-09-30 12:50:21.214	1228	\N	249840	PENDING	MIDTRANS
1356	\N	\N	2025-09-30 12:56:35.942	2025-09-30 12:56:35.942	1229	\N	12492000	PENDING	MIDTRANS
1357	\N	\N	2025-09-30 13:08:43.894	2025-09-30 13:08:43.894	1230	\N	249840	PENDING	MIDTRANS
1358	321	2025-09-30 13:16:14.023	2025-09-30 13:16:14.024	2025-09-30 13:16:16.287	\N	321	249840	PAID	PAYPAL
1359	322	\N	2025-09-30 13:29:29.269	2025-09-30 13:31:14.132	1231	\N	249840	PENDING	MIDTRANS
1360	\N	\N	2025-09-30 13:33:13.941	2025-09-30 13:33:13.941	1232	\N	249840	PENDING	MIDTRANS
1361	323	\N	2025-09-30 13:42:34.589	2025-09-30 13:44:18.069	1233	\N	249840	PENDING	MIDTRANS
1362	324	2025-09-30 13:57:35.795	2025-09-30 13:57:35.799	2025-09-30 13:57:37.61	\N	323	249840	PAID	PAYPAL
1364	\N	\N	2025-09-30 14:05:04.222	2025-09-30 14:05:04.222	1235	\N	249840	PENDING	MIDTRANS
1363	325	\N	2025-09-30 13:59:41.946	2025-09-30 14:05:52.867	1234	\N	249840	PENDING	MIDTRANS
1365	\N	\N	2025-09-30 14:14:26.377	2025-09-30 14:14:26.377	1236	\N	249840	PENDING	MIDTRANS
1367	326	2025-09-30 14:24:19.739	2025-09-30 14:24:19.74	2025-09-30 14:24:23.052	\N	324	249840	PAID	PAYPAL
1368	\N	\N	2025-09-30 14:31:25.228	2025-09-30 14:31:25.228	1238	\N	249840	PENDING	MIDTRANS
1369	\N	\N	2025-09-30 14:33:24.738	2025-09-30 14:33:24.738	1239	\N	249840	PENDING	MIDTRANS
1370	\N	\N	2025-09-30 14:38:17.651	2025-09-30 14:38:17.651	1240	\N	249840	PENDING	MIDTRANS
1371	328	2025-09-30 14:43:40.28	2025-09-30 14:43:40.281	2025-09-30 14:43:44.504	\N	325	249840	PAID	PAYPAL
1372	\N	\N	2025-09-30 14:55:53.532	2025-09-30 14:55:53.532	1241	\N	249840	PENDING	MIDTRANS
1373	\N	\N	2025-09-30 14:56:37.461	2025-09-30 14:56:37.461	1242	\N	249840	PENDING	MIDTRANS
1374	329	2025-09-30 15:00:29.656	2025-09-30 15:00:29.657	2025-09-30 15:00:30.65	\N	326	249840	PAID	PAYPAL
1375	\N	\N	2025-09-30 15:37:35.98	2025-09-30 15:37:35.98	1243	\N	249840	PENDING	MIDTRANS
1376	330	2025-09-30 15:40:28.162	2025-09-30 15:40:28.164	2025-09-30 15:40:29.078	\N	327	249840	PAID	PAYPAL
1378	\N	\N	2025-09-30 15:44:54.892	2025-09-30 15:44:54.892	1245	\N	249840	PENDING	MIDTRANS
1377	331	\N	2025-09-30 15:41:20.406	2025-09-30 15:45:23.072	1244	\N	249840	PENDING	MIDTRANS
1379	\N	\N	2025-09-30 15:57:39.379	2025-09-30 15:57:39.379	1246	\N	249840	PENDING	MIDTRANS
1380	332	\N	2026-02-27 19:28:46.123	2026-02-27 19:29:46.267	1247	\N	1676	PENDING	MIDTRANS
1381	333	2026-02-27 19:31:39.726	2026-02-27 19:31:39.727	2026-02-27 19:31:40.33	\N	328	1676	PAID	PAYPAL
\.


--
-- Data for Name: ryls_registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ryls_registrations (id, full_name, email, residence, nationality, second_nationality, whatsapp, institution, date_of_birth, gender, discover_source, discover_other_text, scholarship_type, created_at, updated_at, ryls_payment_id) FROM stdin;
3	Chen Yi-Ling	metischen1016@gmail.com	Spain, Barcelona	Taiwan	\N	+886908868479	Soochow University/ Ramon Llull University	2002-10-16	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-15 18:12:31.704	2025-08-15 18:12:31.704	23
4	SUJIT PAUDEL	suji.roenetwork@gmail.com	Kathmandu	Nepalese	\N	+9779861322076	Neko Energy Solutions Pvt. Ltd.	2000-06-21	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-16 06:25:58.725	2025-08-16 06:25:58.725	28
5	Sarah Jennifer James 	sarahjenniferjames@gmail.com	Beppu City, Japan 	Indian	\N	+818079824473	Ritsumeikan Asia Pacific University 	2005-01-27	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-16 23:20:29.898	2025-08-16 23:20:29.898	45
6	Julianita Adriance Hartini Rehiara	julia.rehiara@gmail.com	Manokwari, Indonesia	Indonesian 	\N	+6281214604626	Universitas Papua	2002-06-15	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-17 07:56:07.312	2025-08-17 07:56:07.312	52
7	VOUCH DAVATH	dvath177@gmail.com	Phnom Penh	Cambodia	\N	+85560693893	NTT Data	2002-02-15	MALE	OTHER	Facebook	FULLY_FUNDED	2025-08-19 03:18:19.088	2025-08-19 03:18:19.088	101
9	Jhanna Baitiez Rezqi	jb.rezqi@gmail.com	Jakarta,Indonesia	Indonesian	\N	+6281226630486	Thoth AI Indonesia	1994-02-20	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-19 09:40:37.914	2025-08-19 09:40:37.914	132
16	Rossa Rahmawati Handoyo	rossarahmawatihandoyo@gmail.com	Surabaya, Indonesia	Indonesian	\N	+6281231470048	Universitas Airlangga	2004-09-24	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-08-21 02:32:10.624	2025-08-21 02:32:10.624	162
17	Jahda Agniya Mahmudah	agniyamhmdh@gmail.com	Indonesia	Indonesia	\N	6285864042289	Rise Social	1999-02-01	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-21 02:54:04.233	2025-08-21 02:54:04.233	165
19	Reza Abdullah	bsse1335@iit.du.ac.bd	Dhaka	Bangladesh	\N	+8801324215946	University of Dhaka	2001-06-11	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-21 04:55:11.274	2025-08-21 04:55:11.274	173
22	Nurfarahin Afifah Binti Radzuan	nurfarahin.afifah@gmail.com	Batu Pahat,Malaysia	Malaysian	\N	+60167743496	Universiti Teknologi PETRONAS(UTP)	2005-05-06	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-22 14:35:40.154	2025-08-22 14:35:40.154	231
23	Hisyam Abdul Aziz	hisyamabdulaziz@upi.edu	Bandung, Indonesia	Indonesia	\N	+6289661235638	Universitas Pendidikan Indonesia	2000-04-07	MALE	FRIENDS	\N	FULLY_FUNDED	2025-08-23 12:08:00.634	2025-08-23 12:08:00.634	253
24	Nisa Adzhani Lutfiputri	nisa.adzhani@gmail.com	Jakarta, Indonesia	Indonesian	\N	+6281399195892	IPMI Institute	1996-09-28	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-23 13:21:53.707	2025-08-23 13:21:53.707	255
25	Shazreen Affifa Binti Sallehuddin	shazreenaffifa.sallehuddin@gmail.com	Shah Alam, Selangor, Malaysia	Malaysian	\N	+60177684790	University of Wollongong, Malaysia	2006-11-22	FEMALE	OTHER	Facebook post	FULLY_FUNDED	2025-08-24 03:37:39.679	2025-08-24 03:37:39.679	274
26	Savr Khulkhachiev	s.hulhachiev@gmail.com	Saint-Petersburg, Russian Federation	Russian	\N	+79275963454	Peter the Great St.Petersburg Polytechnic University	2002-06-13	MALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-08-25 10:56:25.428	2025-08-25 10:56:25.428	312
27	Naia Rafida Mumtaz	naiarafidamumtaz98@gmail.com	Jakarta	Indonesia	\N	+6285156258224	Padjadjaran University	2003-12-27	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-08-26 02:27:28.571	2025-08-26 02:27:28.571	326
28	Janre Lim	limj.2104@gmail.com	Christchurch	Filipino	\N	+642041187747	University of Canterbury	2004-06-21	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-26 03:12:05.946	2025-08-26 03:12:05.946	327
29	Emmanuella Adrianna Aguslim	emmaaguslim8@gmail.com	Campsie, Australia 	Australia	\N	+61414045392	Flinders University 	2007-05-05	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-26 04:55:58.106	2025-08-26 04:55:58.106	329
30	Imran Farish Taufiq Bin Muhammad Zubairy 	imranikan88rising@icloud.com	Shah Alam, Selangor 	Malaysian 	\N	+601139721301	Management and Science University 	2006-11-13	MALE	FRIENDS	\N	FULLY_FUNDED	2025-08-26 05:04:00.149	2025-08-26 05:04:00.149	330
31	Oeung Venghong	venghongoeung@gmail.com	Phnom Penh City and Cambodia	Khmer	\N	+85577430844	Institute for International Studies and Public Policy	2002-10-12	MALE	OTHER	Telegram Channel	FULLY_FUNDED	2025-08-26 05:06:44.653	2025-08-26 05:06:44.653	331
33	Aikunim Bekbossynova	bekbossynova.aikunim@gmail.com	Almaty, Kazakhstan	Kazakh	\N	+77479555087	Turan University	2003-09-27	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-08-26 05:58:10.703	2025-08-26 05:58:10.703	334
34	A	a@gmail.com	A	A	A	845754484	A	2025-08-21	PREFER_NOT_TO_SAY	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-26 06:35:07.597	2025-08-26 06:35:07.597	336
35	Laura	laura.aliyarova@bk.ru	Kazakhstan 	Kazakh	Ukranian	+77073883322	Almaty Management University	2005-10-26	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-08-26 07:35:18.409	2025-08-26 07:35:18.409	338
36	MOHAMMAD IRFFAN SHAH BIN JAIFUL 	Irffanshahtkd@gmail.com	KOTA KINABALU SABAH	MALAYSIA	\N	60138099806	UNIVERSITI TEKNOLOGI MARA 	2002-07-30	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-26 08:05:07.65	2025-08-26 08:05:07.65	342
37	Pham Tang Cat Luong	ptcluong.sdh231@hcmut.edu.vn	Ho Chi Minh City	Việt Nam	\N	+84398134251	Ho Chi Minh University of Technology	2000-09-18	MALE	FRIENDS	\N	FULLY_FUNDED	2025-08-26 08:05:19.698	2025-08-26 08:05:19.698	340
38	Nadir Ali Khan	nadiralikhan13@gmail.com	Islamabad, Pakistan	Pakistani	\N	+923328972699	Empowering Hands	1999-01-01	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-26 09:09:28.713	2025-08-26 09:09:28.713	345
39	Chen, Yi-Ling	metischen1016@gmail.com	Barcelona, Spain	Taiwan	\N	+886908868479	Soochow Univeristy, Ramon Llull University 	2002-10-16	FEMALE	OTHER	Websites	FULLY_FUNDED	2025-08-26 15:11:37.225	2025-08-26 15:11:37.225	357
40	Aldrin Lynsey Anak Albert 	magdelinealdrin@gmail.com	Miri, Sarawak, Malaysia 	Malaysian	\N	+60134267848	Curtin University Malaysia 	2005-12-10	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-27 03:53:47.455	2025-08-27 03:53:47.455	369
41	Shiela Sanchez Manocay	shielamanocay@gmail.com	Philippines	Filipino	\N	+639669245279	Local Government Unit of Malungon	1994-09-04	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-27 06:06:57.889	2025-08-27 06:06:57.889	377
42	JAYASATHESH BALAMURUGAN	225509@student.upm.edu.my	KLANG, SELANGOR, MALAYSIA 	MALAYSIAN	-	+601116654571	UNIVERSITY PUTRA MALAYSIA	2003-12-25	MALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-08-27 07:38:52.267	2025-08-27 07:38:52.267	395
43	Milana Gomeniuk	milana.gomen@gmail.com	Bangkok, Thailand	Russian	\N	66951988033	FAO UN	2003-03-28	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-08-27 07:50:10.556	2025-08-27 07:50:10.556	397
44	Le Doan Hai Anh	vivianhaianh.work@gmail.com	Vietnam	Vietnamese	\N	+84988289044	Hitachi Energy Vietnam	2001-10-09	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-08-27 07:58:17.865	2025-08-27 07:58:17.865	398
45	Ngô Tuyết Nhi	tuyetnhi11022005a@gmail.com	VN	Y	G	841695236	Y	2025-08-27	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-08-27 08:05:35.701	2025-08-27 08:05:35.701	399
46	Nabila Vita Kamila	nvitakamila@gmail.com	Bandung, West Java, Indonesia	Indonesia	\N	081394952474	Geospasial Insan Mulia	1999-03-06	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-27 09:31:53.597	2025-08-27 09:31:53.597	402
47	Muhammad Noor Danish Adha bin Mohd Herwan	danishadha132@gmail.com	Kuala Lumpur, Malaysia	Malaysia	\N	+601154070929	Unemployed / Recent Graduate	2003-02-12	MALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-08-27 09:36:04.458	2025-08-27 09:36:04.458	403
48	Murodjon Temirov	murodjontemirov5@gmail.com	Bukhara	Uzbekistan	\N	+998909020114	Bukhara State Medical Institution	1997-04-24	MALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-08-27 09:53:37.379	2025-08-27 09:53:37.379	408
49	Muhammad Yusri Naim bin Mohd Yusof	yusrinaim97@gmail.com	Kuala Lumpur	Malaysia	\N	+601114355370	University of Malaya	1997-03-27	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-27 13:31:21.186	2025-08-27 13:31:21.186	423
50	Ruth Andini Putri	ruthandiniputri@gmail.com	Malang	Indonesia	\N	+62881036497805	Institut Seni Indonesia Yogyakarta	2001-03-05	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-08-27 13:51:42.54	2025-08-27 13:51:42.54	427
51	Kundyz Yessenkyzy	kundyz.yes@gmail.com	Grambling, United States	Kazakhstan	\N	+77057731179	Grambling State University	2002-05-09	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-27 16:41:11.015	2025-08-27 16:41:11.015	434
52	Suliman Paris	suliman.paris334@gmail.com	Yogyakarta, Indonesia 	Afghanistan	\N	+93791754334	Universitas Muhammadiyah Yogyakarta (UMY)	1995-05-03	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-28 09:31:41.09	2025-08-28 09:31:41.09	456
53	Nabilah Aisyah Masbuchin	nabilahmasbuchin246@gmail.com	Surabaya, Indonesia	Indonesia	\N	+6288805507035	Airlangga University	2003-08-01	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-08-28 09:40:16.706	2025-08-28 09:40:16.706	453
57	Ejovwo faith akpobome 	ejovwofaith123@gmail.com	Warri, nigeria	Nigeria 	No	+2348076665407	CEO Ajala Yolo limited 	1993-10-10	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-28 12:13:36.116	2025-08-28 12:13:36.116	462
58	Sughra Rajab Ali	rajabalisughra@gmail.com	BLACKTOWN, Australia	Australia	\N	+61469742104	University of Sydney	2005-01-01	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-08-28 13:07:44.806	2025-08-28 13:07:44.806	465
59	Nguyễn Bùi Huyền Trang	nguyenbhuyntrang@gmail.com	Hà Nội	Vietnam	\N	+84901755541	University of Economics and Business-Vietnam National University	2006-06-12	FEMALE	OTHER	Threads	FULLY_FUNDED	2025-08-28 13:25:43.333	2025-08-28 13:25:43.333	469
60	K Poonam Shenoy	kspoonam.shenoy@gmail.com	Seoul	Indian	\N	+821073066396	Seoul National University	1996-03-06	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-08-28 15:36:10.29	2025-08-28 15:36:10.29	475
61	Nabilah Aisyah Masbuchin	nabilahmasbuchin246@gmail.com	Surabaya, Indonesia	Indonesia	\N	+6288805507035	Airlangga University	2003-08-01	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-08-29 04:50:30.81	2025-08-29 04:50:30.81	488
62	Miras Zhumatayev	zmiras17r@gmail.com	Almaty, Kazakhstan	kazakh	\N	+77759486456	Kazakh-British Technical University	2006-01-01	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-29 07:17:26.47	2025-08-29 07:17:26.47	490
63	Argyn Baikuatov 	yctne@yandex.ru	Almaty, Kazakhstan 	Kazakh 	\N	+77066061404	Independent professional – currently based in Almaty, Kazakhstan	1997-08-13	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-08-29 07:46:59.034	2025-08-29 07:46:59.034	492
64	Ahmad Rokhshani 	ahmadrokhshani02@gmail.com	Yogyakarta Indonesia 	Afghanistan 	\N	+93728747246	Universitas Muhammadiyah Yogyakarta 	1995-06-15	MALE	FRIENDS	\N	FULLY_FUNDED	2025-08-29 09:04:28.054	2025-08-29 09:04:28.054	495
65	ROONEY BIN RICKY JAMESON	ryrooney351@gmail.com	Sarawak , Malaysia 	Malaysian	\N	+60178598065	University of Malaya	2005-09-30	MALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-08-29 10:28:20.401	2025-08-29 10:28:20.401	496
66	AFIQAH BINTI SAIFUL ADLI 	afiqahadli5@gmail.com	GOMBAK and MALAYSIA 	MALAYSIAN	\N	+60104852639	Universiti Kebangsaan Malaysia  	2005-10-07	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-08-30 08:12:58.549	2025-08-30 08:12:58.549	506
67	Shazreen Affifa Binti Sallehuddin	shazreenaffifa.sallehuddin@gmail.com	Shah Alam, Selangor, Malaysia	Malaysian	\N	+60177684790	University of Wollongong, Malaysia	2006-11-22	FEMALE	OTHER	Facebook post	FULLY_FUNDED	2025-08-30 13:46:15.505	2025-08-30 13:46:15.505	511
68	Saida Yerbolatova	yerbolatovasaida@gmail.com	Rieti, Italy	Kazakhstan	\N	+393343408437	Sapienza University of Rome	2002-10-12	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-08-30 15:26:15.254	2025-08-30 15:26:15.254	513
69	Eldar Khaidarov	fidehue@mail.ru	Rieti, Italy	Kazakh	none	+393515073698	Sapienza University of Rome	2004-01-11	MALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-08-30 15:29:00.747	2025-08-30 15:29:00.747	514
70	AFIQAH BINTI SAIFUL ADLI 	afiqahadli5@gmail.com	GOMBAK and MALAYSIA 	MALAYSIAN	\N	+60104852639	Universiti Kebangsaan Malaysia  	2005-10-07	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-08-30 16:15:18.276	2025-08-30 16:15:18.276	518
71	MUHAMMAD HASIF HAZWAN BIN ALIAS	hasif.presidenasc@gmail.com	Kelantan, Malaysia	Malaysia	No	+60194562497	Universiti Teknologi MARA (UiTM)	2005-06-20	MALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-08-30 18:14:42.44	2025-08-30 18:14:42.44	519
72	Temirlan Rashid	temirlanrashid@gmail.com	Windsor, Ontario, Canada	Kazakh	\N	+77075520213	University of Windsor	2002-05-13	MALE	OTHER	From Telegram Channel: t.me/beyondsd	FULLY_FUNDED	2025-08-31 00:14:29.57	2025-08-31 00:14:29.57	520
73	Araibek Zhiyengaliyev	zh.araybek@aogu.edu.kz	Atyrau, Kazakhstan	Kazakh	\N	+77052468710	Atyrau Oil and Gas University after named Safi Utebayev	2000-04-02	MALE	FRIENDS	\N	FULLY_FUNDED	2025-08-31 18:51:36.6	2025-08-31 18:51:36.6	536
74	Akorede Rasak	korederasak89@gmail.com	Lagos	Nigeria	\N	+2349130614786	Media Evolution	2005-02-17	MALE	OTHER	I learned about the RISE Summit through my recently completed residency in Sweden, where I was advised by a representative from Arduino. After seeing my strong interest in climate action and technology-driven solutions, they suggested that RISE would be an ideal next step to amplify my impact.	FULLY_FUNDED	2025-09-01 11:20:40.752	2025-09-01 11:20:40.752	552
75	Mariam Ramzy	mariammramzy030@gmail.com	Cairo, Egypt	Egyptian	\N	+201127093620	Prezlab	1998-11-20	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-01 14:21:16.744	2025-09-01 14:21:16.744	555
76	Zahra Hejria 	zahrahjria@gmail.com	Rathenow, Germany	Afghanistan	\N	+4917662284993	Inlingua 	2000-01-20	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-01 17:37:01.554	2025-09-01 17:37:01.554	561
77	Nurul Iman binti Nur Elahi	nurulimanelh@gmail.com	Petaling Jaya, Selangor, Malaysia	Malaysia	\N	+60143420370	Toyota Malaysia / Universiti Teknologi MARA	2000-10-04	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-02 06:55:28.016	2025-09-02 06:55:28.016	566
79	Roksolana Sobolevska 	sobolevskaroksolana@gmail.com	Kyiv, Ukraine 🇺🇦 	Ukrainian 	-	380681311238	Junior tax associate at Crowe Mikhailenko / Final-year Master's students of Yaroslav Mudryi National Law University	2004-11-10	FEMALE	OTHER	Telegram channels	FULLY_FUNDED	2025-09-02 09:41:45.35	2025-09-02 09:41:45.35	574
80	Ebi Rexhepi	ebirexhepi07@gmail.com	Tirana, Albania	Albanian	\N	+447926602009	RIT Tirana	2007-01-17	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-02 09:54:51.007	2025-09-02 09:54:51.007	572
81	Diana Skalko	dskalko12@gmail.com	Poland, Lodz	Ukraine	\N	+48881639428	DataArt Poland, International IT Company	1991-10-24	FEMALE	OTHER	From the Ukrainian IT community	FULLY_FUNDED	2025-09-02 09:57:00.688	2025-09-02 09:57:00.688	577
82	Anastasiia Kolokolova 	kotionok.apple@gmail.com	Dnipro, Ukraine	Ukrainian 	\N	+48732907464	Alfred Nobel university(Dnipro,Ukraine), work place: cafe “High Hill”(Dnipro, Ukraine)	2005-06-24	FEMALE	OTHER	Telegram channel 	FULLY_FUNDED	2025-09-02 10:20:51.224	2025-09-02 10:20:51.224	579
83	Tetiana Shvydka	tklunko@gmail.com	Kyiv, Ukraine	Ukrainian 	\N	+380664193016	Self-employed (Japanese language teacher & founder of Japanese language learning space @momijinotes), bachelor (Taras Shevchenko National University of Kyiv)	2002-06-25	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-02 10:52:03.938	2025-09-02 10:52:03.938	580
84	Ospankulov Aidar	aidar.boss.2002@gmail.com	Almaty, Kazakhstan	Kazakh	\N	+77071438010	MeaLuna / Kazakh-British Technical University 	2002-10-10	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-02 11:30:09.083	2025-09-02 11:30:09.083	585
85	Sophie-Marie Ludwig	sophie-marie.ludwig@hotmail.de	Hamburg, Germany	Germany	\N	+4915223388204	University of Hamburg	2002-06-26	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-02 11:34:56.813	2025-09-02 11:34:56.813	586
86	Ario Waskito	ariowaskito21@gmail.com	Depok	Indonesia	\N	081938440491	MRT Jakarta	1995-11-21	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-02 13:05:51.106	2025-09-02 13:05:51.106	589
87	Veronika Akakhian	akahyan.veronika@gmail.com	Bakhchysarai, In November, I will be in Vietnam and will be able to fly from there	Ukraine	\N	+79169632122	Labise Online School, UNDP Online Volunteer	1995-06-30	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-02 13:23:31.059	2025-09-02 13:23:31.059	590
89	Anastasiia Syrvetnyk 	nastysia2208@gmail.com	Prague, Czech Republic 	Ukraine 	\N	+420721476445	Ivan Franko National University of Lviv — Faculty of Foreign Languages, English Philology / Hotel Liberty Prague — Receptionist	2005-08-22	FEMALE	OTHER	Telegram 	FULLY_FUNDED	2025-09-02 14:27:08.375	2025-09-02 14:27:08.375	591
90	Trang 	hathaotrang@gmail.com	Hanoi 	Vietnamese	\N	+847070454609	Diplomatic Academy of Vietnam 	2004-09-04	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-02 15:18:24.273	2025-09-02 15:18:24.273	594
91	Lee Olson	lumaleeolson@gmail.com	Reno, USA	USA	Philippines	+17024494944	University of Nevada Reno	2002-10-10	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-02 20:10:26.718	2025-09-02 20:10:26.718	603
92	Hafidza Mahira	haffmahirr@gmail.com	Bandung	Indonesia	\N	+6287722608331	Yaksa Pelestari Bumi Berkelanjutan	2001-04-06	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-03 04:21:55.191	2025-09-03 04:21:55.191	605
93	Olha Tsiupiak 	olhatsiupiak@gmail.com	Malaysia 	Ukrainian 	\N	+4555277857	Aalborg University, Denmark 	2000-08-18	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-03 05:48:14.044	2025-09-03 05:48:14.044	607
96	Nikol	nikoltopilo@gmail.com	Kyiv, Ukraine 	Ukranian	\N	+380671581197	Tara’s Shevchenko National University of Kyiv 	2003-02-20	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-03 07:59:18.273	2025-09-03 07:59:18.273	609
99	Aurika Matvei	aurikamatvei@gmail.com	Kropyvnytskyi, Ukraine 	Ukrainian	Greek	+380508226977	Private Higher Education Institution “Kyiv University of Culture”	2005-06-15	FEMALE	OTHER	A Ukrainian Telegram channel full of opportunities	FULLY_FUNDED	2025-09-03 08:31:26.702	2025-09-03 08:31:26.702	611
100	Nikol Topylo	nikoltopilo@gmail.com	Kyiv, Ukraine	Ukranian	\N	+380671581197	Taras Shevchenko National University of Kyiv	2003-02-20	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-03 09:13:29.881	2025-09-03 09:13:29.881	612
105	Muhammad A'rif Bin Abdul Hadi 	theknowledged17@gmail.com	Brunei-Muara, Brunei Darussalam, Kampung Meragang	Brunei	\N	+6738167271	Kolej International Graduate Studies	2004-05-17	MALE	OTHER	My sister from Unissa who is also member of Asean Classroom	FULLY_FUNDED	2025-09-04 06:29:50.583	2025-09-04 06:29:50.583	616
106	Adlin Suraya binti Ramli	adlinsuraya29@gmail.com	Kuala Lumpur, Malaysia	Malaysian	\N	+601129326753	Universiti Malaya 	2000-08-29	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-04 09:53:04.623	2025-09-04 09:53:04.623	618
108	Nguyen Thi Lan Huong	nguyenthilanhuong2023.ng@gmail.com	Ho Chi Minh City, Vietnam	Vietnamese	\N	+84352555463	University of 	2025-09-04	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-05 01:40:57.964	2025-09-05 01:40:57.964	627
109	SITI SYUHADA BALQIS BINTI ABDUL HALIM	syuhadabalqis06@gmail.com	Sungai Buloh, Malaysia	Malaysian	\N	+60199558107	The National University of Malaysia	2004-06-23	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-05 06:08:28.249	2025-09-05 06:08:28.249	631
110	Selin Kahraman	kahraman.selin2002@gmail.com	Batumi, Georgia	Georgian	\N	+995574402124	LTD DB Holding/ 10X (10x.edu.ge)	2002-11-03	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-05 06:33:17.72	2025-09-05 06:33:17.72	632
111	Msnxjxnnx	skdjdjxmxmx@gmail.com	 Бсьбсбсбс	 Ьсьбссьс	Ьчьчььч	77780580818	Сьладвдад	2000-09-05	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-05 06:39:52.552	2025-09-05 06:39:52.552	634
112	Muhammad Nor Iman bin Haji Norman	nuriman210423@gmail.com	Bandar Seri Begawan	Bruneian	\N	+6738876684	University	2003-04-21	MALE	FRIENDS	\N	FULLY_FUNDED	2025-09-05 13:26:11.443	2025-09-05 13:26:11.443	640
114	Mauricio Garza Frias	mauricio.garzaf@outlook.com	Monterrey, México	Mexican	\N	+526144085047	Instituto Tecnológico y de Estudios Superiores de Monterrey	2003-08-23	MALE	FRIENDS	\N	FULLY_FUNDED	2025-09-05 15:56:08.565	2025-09-05 15:56:08.565	641
115	Zhansaya Aluadin 	zhansaya00101@gmail.com	Almaty, Kazakhstan	Kazakh	\N	+77021857261	Nazarbayev University	2003-11-16	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-07 10:42:31.797	2025-09-07 10:42:31.797	658
116	Aditi Sharma	watashiaditi@gmail.com	Delhi	India	\N	+919560344874	Arwachin International School	2008-05-20	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-07 11:34:45.802	2025-09-07 11:34:45.802	659
117	Aditi Sharma	watashiaditi@gmail.com	Delhi	India	\N	+919560344874	Arwachin International School	2008-05-20	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-07 11:46:37.634	2025-09-07 11:46:37.634	660
118	Sonia Gustina Nasution	Soniannasution01@gmail.com	Bandung, Indonesia	Indonesia	-	+6287816986399	The Local Enablers	1998-08-01	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-07 15:17:34.917	2025-09-07 15:17:34.917	665
119	Maksym Antonenko	maksym@antonenko.info	Kyiv, Ukraine	Ukrainian	\N	+380631178982	Parliament of Ukraine & Taras Shevchenko National University of Kyiv, Institute of International Relations	2001-03-22	MALE	OTHER	Telegram 	FULLY_FUNDED	2025-09-07 19:14:16.098	2025-09-07 19:14:16.098	669
120	Nguyen Thuy Duong	deehero.1304@gmail.com	Hà Nội	Vietnamese	\N	+84961732395	Lotus Technology Services Group	2001-04-13	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-08 09:35:45.68	2025-09-08 09:35:45.68	682
121	Riski Setiabudi	riskis.budi@gmail.com	Jakarta, Indonesia	Indonesian	\N	+6285899026924	PT Indo Raya Tenaga	1997-10-13	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-08 10:41:51.985	2025-09-08 10:41:51.985	685
123	Sofiia Zhukovska 	zhukovs06479@gmail.com	Fastiv, Ukraine 	Ukrainian 	\N	+380976709397	Independent digital creator (crochet designer)	2003-11-21	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-08 19:27:43.325	2025-09-08 19:27:43.325	694
124	Sanaullah Baburi	sanaullahbaburi99@gmail.com	Surabaya	Indonesia	\N	+6285182296416	Sunan Ampel Islamic State Surabaya University	2002-08-28	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-08 20:11:15.579	2025-09-08 20:11:15.579	695
125	Utami Sekar Syafitri 	ussyafitri25@gmail.com	Bogor city	Indonesia 	-	+628976897940	Universitas Indonesia 	2003-11-25	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-09 00:24:35.298	2025-09-09 00:24:35.298	696
128	Malika Amatova	malikamatova@icloud.com	Osh, Kyrgyzstan	Kyrgyz	\N	+996558044089	“I Class” private school	2003-02-04	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-09 09:12:48.335	2025-09-09 09:12:48.335	705
129	Elizaveta	eli.pleshkova2305@yandex.ru	Saint Petersburg Russia	Russian	\N	+79312552768	Saint Petersburg Mining University	2003-07-19	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-09 15:26:22.541	2025-09-09 15:26:22.541	707
131	Natallia Shpankova 	kinganddannis@gmail.com	Republic of Belarus, city Gomel	Belarusian 	\N	+375292387817	State institution, Ambulance station, doctor	1996-01-30	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-10 16:57:13.593	2025-09-10 16:57:13.593	727
132	Zara Usman	usmanzara@yahoo.com	Toronto, Canada	Canada	Nigeria	+16474107945	Morningstar/ University of Cambridge	1993-11-25	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-10 20:52:09.123	2025-09-10 20:52:09.123	730
133	Ángel Sebastián González Bermúdez	a01733037@tec.mx	Monterrey, México	Mexican	\N	+522221395250	Instituto Tecnológico y de Estudios Superiores de Monterrey	2002-10-07	MALE	FRIENDS	\N	FULLY_FUNDED	2025-09-11 08:08:18.551	2025-09-11 08:08:18.551	738
138	Jatin Kumar	jatinkumar3042@gmail.com	Karachi	Pakistan	\N	+923363042492	szabist 	2002-11-30	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-11 12:32:25.666	2025-09-11 12:32:25.666	740
148	Shaikh Jai Mukhriz bin shaikh muzammil	sjm200503@gmail.com	Petaling Jaya, Selangor, Malaysia	Malaysia	\N	+60129712971	Universiti Kuala Lumpur	2003-05-20	MALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-11 13:51:30.236	2025-09-11 13:51:30.236	743
149	Skkdkxxk	mzkxkkdxkkd@gnail.com	Snxkxjx	Sjxkkxkxxj	\N	+77780580818	Zmnxkxjxx	2009-09-11	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-11 15:39:46.729	2025-09-11 15:39:46.729	744
153	Diana Carolina Naranjo Barreto	dc.naranj1@gmail.com	Bogotá	Colombia	\N	+573115775620	Secretaria de Movilidad	1994-01-15	FEMALE	OTHER	Pagina web Secretaria de Bogotá	FULLY_FUNDED	2025-09-12 05:27:43.866	2025-09-12 05:27:43.866	747
154	Vazgen Tatosyan	vazgentatosyanwork@gmail.com	Ararat, Armenia	Armenian	\N	+37493886627	Scylla AI	2002-07-15	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-12 22:13:59.647	2025-09-12 22:13:59.647	752
155	hassan ali	ahadbuttar@gmail.com	Pakistan	Pakistan	\N	00923004028488	Provincial Assembly of Punjab Pakistan	1991-05-01	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-12 22:27:22.193	2025-09-12 22:27:22.193	753
157	Nurin Aishah	nurinaishah17@gmail.com	Kuala Lumpur	Malaysia	\N	+601125460434	Universiti Teknologi MARA Puncak Perdana	2005-06-20	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-13 04:04:28.075	2025-09-13 04:04:28.075	756
158	Ayana Supueva	ayana.supueva@gmail.com	Naryn, Kyrgyzstan	Kyrgyzstan 	\N	+996777356635	University of Central Asia 	2003-05-17	FEMALE	OTHER	Threads post	FULLY_FUNDED	2025-09-13 10:27:00.079	2025-09-13 10:27:00.079	764
160	Michael Oranlius Prasmana	michaelprasmana01@gmail.com	Bandung	Indonesia	\N	088225003012	Institut Teknologi Bandung	2003-05-31	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-14 10:09:25.797	2025-09-14 10:09:25.797	777
161	Shannan nsnnsns	snnznnx@gmail.com	Znznxnxx	Skzkkxz	Zmnxnx	+77770856677976	Sksnksdk	2010-09-20	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-15 12:31:17.624	2025-09-15 12:31:17.624	789
166	Maria Julia Pareja Abarca	mariajuliaparejaabarca@gmail.com	Arequipa, Perú	Peruvian	\N	+51966899184	Universidad Católica Santa María	2005-06-02	FEMALE	OTHER	LinkedIn	FULLY_FUNDED	2025-09-16 03:55:31.647	2025-09-16 03:55:31.647	796
167	Lalita Tri Adila	lalita@orangutan.or.id	Indonesia	Indonesian	\N	085772398019	Borneo Orangutan Survival Foundation	1994-12-01	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-16 04:17:30.63	2025-09-16 04:17:30.63	798
168	Qonita Salma	qonitasalma1864@gmail.com	Surabaya, Indoensia	Indonesian	-	+6285198129831	Airlangga University	2003-09-11	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-16 06:26:22.093	2025-09-16 06:26:22.093	801
169	Kadhirah Binti Shaharudin	kadhirahshaharudin03@gmail.com	Petaling Jaya	Malaysia	\N	+601156330384	SAITO UNIVERSITY COLLEGE	2003-03-03	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-19 15:23:04.128	2025-09-19 15:23:04.128	842
170	Kadhirah Shaharudin	kadhirahshaharudin03@gmail.com	Petaling Jaya, Malaysia	Malaysian	\N	+601156330384	SAITO UNIVERSITY COLLEGE	2003-03-03	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-19 16:15:26.978	2025-09-19 16:15:26.978	843
239	Salma Ayari	salmaayariqn@gmail.com	Manouba, 2010, Tunisia	Tunisie	\N	+21628207510	University of Manouba	2000-02-07	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-25 20:06:24.839	2025-09-25 20:06:24.839	1050
171	Natalia Estefanía Fuelantala Micanquer 	estefaniamicanquer@gmail.com	Resguardo indígena de Muellamues- Guachucal, Nariño- Colombia 	Colombiana 	\N	3166263904	Sena	2004-10-11	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-19 16:22:59.307	2025-09-19 16:22:59.307	844
172	Kadhirah Binti Shaharudin	kadhirahshaharudin03@gmail.com	Petaling Jaya, Selangor, Malaysia	Malaysian	\N	+601156330354	SAITO UNIVERSITY COLLEGE	2003-03-03	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-19 17:50:31.555	2025-09-19 17:50:31.555	845
174	Daneswara Reksohadiprodjo	daneswara.r@gmail.com	Toshima, Japan	Indonesian	\N	+818061841562	Tokyo International University	2004-03-18	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-20 01:10:38.005	2025-09-20 01:10:38.005	847
184	Arevik Lalayan	norayr.babayan@mail.ru	AM	Armenian	\N	+37491421902	Orthodent Clinic 	1988-02-12	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-20 05:25:18.855	2025-09-20 05:25:18.855	849
185	Roza Gharibyan 	gharibyanrosie@gmail.com	Yerevan, Armenia	Armenian	\N	+37494792484	European University in Armenia (EUA)	2004-09-27	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-20 05:51:36.237	2025-09-20 05:51:36.237	850
186	Sabina Sabdenova	sabina.sattva@gmail.com	Kazakhstan, Karaganda	Kazakh	\N	+77052594323	Mindset Coach	1990-11-06	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-20 07:05:33.747	2025-09-20 07:05:33.747	851
188	Sokhak Melkonyan	sokhakmelkonyan@gmail.com	Armenia	Armenia	\N	+37441117799	Vanadzor State University 	1993-12-10	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-20 07:25:27.713	2025-09-20 07:25:27.713	852
189	Zara Usman	usmanzara@yahoo.com	Toronto Canada	Canada	\N	+16474107945	Morningstar	1993-11-25	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-21 00:23:14.651	2025-09-21 00:23:14.651	862
190	Hana Karimah	hanaakarimaah@gmail.com	Jakarta, Indonesia 	Indonesia 	\N	087876673046	President University 	2003-12-14	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-21 14:29:59.927	2025-09-21 14:29:59.927	871
191	Karen Petrosyan	karpetrosyan79@gmail.com	Republic of Armenia	Armenian 	\N	37499993906	MSU named after M.V. Lomonosov	2006-07-01	MALE	FRIENDS	\N	FULLY_FUNDED	2025-09-21 16:40:30.744	2025-09-21 16:40:30.744	873
192	Nataliia Solntseva	solna894@gmail.com	Markdorf, Germany	Ukraine 	\N	+4915206828496	-	1999-06-03	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-21 17:23:03.187	2025-09-21 17:23:03.187	874
193	Xurshida Ahmadjonova	akhmadjonova3101@gmail.com	Tashkent, Uzbekistan	Uzbek	\N	+998903315353	Webster University in Tashkent	2006-01-31	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-22 06:56:06.43	2025-09-22 06:56:06.43	882
194	Skdnddk	skjdjxnxjx@gmail.com	Jdjdnjxjx	Djxjjxjx	\N	+77780580818	Nsnznnx	2025-09-22	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-22 08:29:56.597	2025-09-22 08:29:56.597	886
195	Alina	alinapetrosyan2004@gmail.com	Armenia	Armenian 	\N	+37498722502	Russian-Armenian University	0004-09-03	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-22 08:40:06.825	2025-09-22 08:40:06.825	887
196	Glenys	glenystandra1312@gmail.com	Jakarta, Indonesia	Indonesian	\N	+6282249053327	Hult International Business School	1998-12-13	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-22 09:51:54.009	2025-09-22 09:51:54.009	888
197	Mohammed Muhaiminur Rahman	muhit5869@gmail.com	Dhaka, Bangladesh	Bangladeshi	\N	+8801312509392	South Breeze School	2007-04-13	MALE	FRIENDS	\N	FULLY_FUNDED	2025-09-23 00:32:09.149	2025-09-23 00:32:09.149	896
198	Truc Lam Dao	tlam.dao1902@gmail.com	Hanoi, Vietnam	Vietnamese	\N	+84981376201	The Diplomatic Academy of Vietnam	2001-02-19	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-23 02:14:57.11	2025-09-23 02:14:57.11	899
199	Truc Lam Dao	tlam.dao1902@gmail.com	Hanoi, Vietnam	Vietnamese	\N	+84981376201	The Diplomatic Academy of Vietnam	2001-02-19	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-23 02:15:00.32	2025-09-23 02:15:00.32	899
203	Umar Sani Umar Sani	umarsani361@gmail.com	Kota Surakarta	Tes	Tes	089603219442	Tes	2000-12-02	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-23 04:55:32.796	2025-09-23 04:55:32.796	904
204	nsdlkfnslf	sdfdsfs@gmail.com	ndlfk	dfdsfs	\N	35346576978	sefdsfgdg	2003-01-23	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-23 07:26:15.034	2025-09-23 07:26:15.034	905
205	Andika Kristinawati	andikakristinawati@gmail.com	Bogor, Indonesia	Indonesia	\N	+6283847168712	PT Interstisi Material Maju	1993-09-01	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-23 07:53:24.494	2025-09-23 07:53:24.494	908
208	Zahrania Ammalia Saraswatiy	zhrniammalia@gmail.com	Jakarta, Indonesia	Indonesia	\N	+62811185588	Universitas Gadjah Mada	1996-05-29	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-23 08:30:31.241	2025-09-23 08:30:31.241	912
216	Daniela Bastos Diaz	danybastos2003@gmail.com	Buenos Aires	Colombian	\N	+541160073149	University of Buenos Aires	2003-02-09	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-23 18:23:12.444	2025-09-23 18:23:12.444	929
217	Reil Abdelrahman	reilabdelrahman@gmail.com	Auburn	United States	Sudan	13344443378	Auburn University	2001-03-06	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-23 22:47:59.337	2025-09-23 22:47:59.337	933
218	Muhammad Yusri Naim bin Mohd Yusof	yusriinaiim@gmail.com	Kuala Lumpur, Malaysia	Malaysia	\N	+601114355370	University of Malaya	1997-03-20	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-24 00:52:37.532	2025-09-24 00:52:37.532	934
220	Muhammad Osmar Zaidan Al Wafi	osmarzdn@gmail.com	Banjarbaru	Indonesia	\N	+6282157277993	Universitas Lambung Mangkurat	2004-12-05	MALE	FRIENDS	\N	FULLY_FUNDED	2025-09-24 01:03:04.91	2025-09-24 01:03:04.91	935
221	Heini A. Borromeo	h.borromeo07@gmail.com	Bais City, Philippines	Philippines 	\N	+639631717352	Silliman University	2002-07-07	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-24 05:01:09.741	2025-09-24 05:01:09.741	943
222	RAWINNIPA PRACHUABMON	rawinnipathepooh@gmail.com	KhonKaen, Thailand	Thai	\N	+66824033190	KhonKaen University International College	2004-07-06	FEMALE	OTHER	facebook	FULLY_FUNDED	2025-09-24 05:32:58.58	2025-09-24 05:32:58.58	951
223	Rachata Suesat	rachata_s@sepo.go.th	Bangkok, Thailand	Thailand	\N	+66959159654	State Enterprise Policy Office	1993-08-30	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-24 08:07:18.788	2025-09-24 08:07:18.788	965
225	Duishenova Nuraiym Melisovna 	dujsenovanurajym148@gmail.com	Osh,Kyrgyzstan 	Kyrgyz 	No	+996220160462	International relations 	2006-07-02	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-24 14:42:03.103	2025-09-24 14:42:03.103	982
226	C	d@dif.oego	S	Filipino	\N	9157133777	Ateneo de Manila University	2002-07-13	FEMALE	OTHER	Facebook	FULLY_FUNDED	2025-09-24 17:37:13.455	2025-09-24 17:37:13.455	988
227	Gabrielle Beeput	gabriellebeeput@gmail.com	Jamaica	Jamaican	\N	+18762794605	University of Technology, Jamaica (Chemical Engineering)	2002-05-08	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-24 21:42:39.333	2025-09-24 21:42:39.333	991
228	Ma. Sheena Danica Bonites	sbonites22@gmail.com	Roxas City, Philippines	Filipino	\N	+639499029917	Helen Keller Intl - Philippines	2000-06-02	FEMALE	OTHER	Facebook	FULLY_FUNDED	2025-09-25 00:19:30.287	2025-09-25 00:19:30.287	996
229	Shella Permatasari Santoso	shella@ukwms.ac.id	Surabaya	Indonesia	\N	+628113380555	Universitas Katolik Widya Mandala Surabaya	1990-11-09	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-25 03:43:26.751	2025-09-25 03:43:26.751	1004
230	Hul Sovannthyda	hsovannthyda@gmail.com	Phnom Penh, Cambodia	Cambodian	\N	+85586405040	Royal Academy of Cambodia	2000-11-13	FEMALE	OTHER	Others Facebook account	FULLY_FUNDED	2025-09-25 04:23:44.297	2025-09-25 04:23:44.297	1008
231	Jindrayani Nyoo Putro	jindrayani@ukwms.ac.id	Surabaya, Indonesia	Indonesia	\N	+6285132686547	Universitas Katolik Widya Mandala Surabaya	1994-05-08	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-25 04:35:35.748	2025-09-25 04:35:35.748	1012
232	Nguyen Thuy Duong	Duongnguyen080411@gmail.com	Ha Noi, Vietnam	Vietnamese	\N	+84329101861	Diplomatic Academy of Vietnam	2004-11-08	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-25 05:34:43.182	2025-09-25 05:34:43.182	1019
234	Dessiew Abunie Dejenie	abyssiniantouroperator@gmail.com	Addis Ababa, Ethiopia 	Ethiopia 	No	+251920009100	Abyssinian Tour Operator	1989-06-24	MALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-25 06:50:14.742	2025-09-25 06:50:14.742	1026
235	Pov Monthit	bunthitpov54@gmail.con	Cambodia	Cambodian	Cambodian	+85593469093	Royal University of Pnhom Penh (RUPP)	2005-11-25	MALE	OTHER	Telegram	FULLY_FUNDED	2025-09-25 12:17:30.024	2025-09-25 12:17:30.024	1038
236	Renee Isabella L. Aguila	rilaguila01@gmail.com	Las Pinas, Metro Manila, Philippines	Filipino	\N	09183463853	Freelance (Graduated from De La Salle - College of Saint Benilde)	2001-08-28	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-25 12:41:30.646	2025-09-25 12:41:30.646	1039
238	Karyna Romanchenko 	karina.romanchenko@gmail.com	Kyiv, Ukraine 	Ukrainian 	\N	+380686323109	National Preserve "Kyiv-Pechersk lavra"	2002-02-07	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-25 15:52:37.83	2025-09-25 15:52:37.83	1042
240	Paola Perales Pacheco	paola.peralespacheco@gmail.com	Lima- Perú	Peruana	\N	+591960156556	Terre des hommes Germany	1993-03-11	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-26 03:06:56.4	2025-09-26 03:06:56.4	1056
241	Kith Patricia 	patriciakith2003@gmail.com	Cambodia 	Cambodian 	NA	+85578551678	Cambodia-Japan Cooperation Center 	2003-09-01	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-26 07:38:37.686	2025-09-26 07:38:37.686	1068
243	Jahda Agniya Mahmudah	agniyamhmdh@gmail.com	Indonesia	Indonesia	\N	6285864042289	Rise Social	1999-02-01	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-26 09:22:24.301	2025-09-26 09:22:24.301	1070
244	 Dimen Tammer	dimenxtammer@gmail.com	Germany Lübeck	german	Kurdish	+4915561391436	Global Academic Leadership alliance	1997-03-22	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-26 11:09:50.937	2025-09-26 11:09:50.937	1071
245	Ahadin Syarifudin Fahmi, SKM, M.KKK	fahmiadimara.project@gmail.com	Kab. Sidoarjo	Indonesia	\N	+6281234111947	Sekawan Bumi Foundation/Airlangga University	1992-08-20	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-26 12:40:25.589	2025-09-26 12:40:25.589	1073
247	Soyanin ING	ingsoyanin@gmail.com	Cambodia(Phnom Penh)	Cambodian 	\N	+85577799728	American University of Phnom Penh	2004-12-04	FEMALE	OTHER	Telegram Group	FULLY_FUNDED	2025-09-26 13:21:17.667	2025-09-26 13:21:17.667	1076
250	Aziza Akter Anisa	azizaakteranisa2005@gmail.com	Dhaka, Bangladesh	Bangladeshi	\N	+8801572901018	Shahjalal University of Science and Technology	2005-12-30	FEMALE	OTHER	AYFN	FULLY_FUNDED	2025-09-26 14:33:44.509	2025-09-26 14:33:44.509	1081
251	DHAANESWARAN S/O SETHURAJ	dhaanes2005@gmail.com	Malacca, Malaysia	Malaysian	\N	01161994766	University Malaysia Pahang Al-Sultan Abdullah	2005-10-28	MALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-26 14:36:45.661	2025-09-26 14:36:45.661	1084
252	Maarij Shamim	maarij.shamim3@gmail.com	Pakistan, Karachi	Pakistan	\N	+923318345308	Graduate Researcher 	2001-12-06	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-26 17:14:08.626	2025-09-26 17:14:08.626	1091
254	Nur Amira Khairiena binti Hussin	khairienaamira@gmail.com	Selangor, Malaysia	Malaysian	\N	+60133826887	Universiti Teknologi MARA Shah Alam	2006-03-14	FEMALE	OTHER	AYFN Websites	FULLY_FUNDED	2025-09-26 19:13:55.392	2025-09-26 19:13:55.392	1094
255	Meyly Ung	u.meylyung@gmail.com	Phnom Penh, Cambodia	Cambodian	\N	+85511423777	American University of Phnom Penh	2004-12-27	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-27 10:19:15.788	2025-09-27 10:19:15.788	1115
256	Ario Waskito	ariowaskito21@gmail.com	Depok	Indonesia	\N	+6281938440491	MRT Jakarta	1995-11-21	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-27 11:25:38.245	2025-09-27 11:25:38.245	1117
259	Alona Bondarieva	alena.bon03@gmail.com	Batumi, Georgia	Ukrainian	\N	+380508576583	National University "Zaporizhzhia Polytechnic"	2003-12-30	FEMALE	OTHER	Telegram channel	FULLY_FUNDED	2025-09-27 13:11:00.262	2025-09-27 13:11:00.262	1122
261	Mendykhan Kuralay 	kuralajmendyhan@gmail.com	Almaty, Kazakhstan 	Kazakh	\N	+77019644814	University of International Business	2004-11-06	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-27 14:35:03.295	2025-09-27 14:35:03.295	1130
262	Ario Waskito	ariowaskito21@gmail.com	Depok	Indonesia	\N	+6281938440491	MRT Jakarta	1995-11-21	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-27 15:39:06.38	2025-09-27 15:39:06.38	1132
263	Nargiza	nargizaburxanova1@gmail.com	Samarkand, Uzbekistan	Uzbek	\N	+998949849933	Tashkent Research Institute of Vaccines and Serums	1995-11-02	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-27 16:49:15.481	2025-09-27 16:49:15.481	1133
265	Abubakar Salisu Saulawa	abubakarsalisu019@gmail.com	NIGERIA	Nigeria	NIGERIA	+2348139683356	graduate	1998-01-18	MALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-27 21:47:25.627	2025-09-27 21:47:25.627	1137
266	Ario Waskito	ariowaskito21@gmail.com	Depok	Indonesia	\N	+6281938440491	MRT Jakarta	1995-11-21	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-28 03:17:15.676	2025-09-28 03:17:15.676	1142
267	Penina Sua-Ioka	p.ioka@nus.edu.ws	Samoa	Samoan	\N	6857161316	National University of Samoa	1991-08-27	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-28 05:42:13.422	2025-09-28 05:42:13.422	1148
268	TIAS AJI SETIYAWAN	tiasaji976@gmail.com	SANGATTA, KUTAI TIMUR, EAST KALIMANTAN	Indonesia	\N	+6287825175697	ISLAMIC UNIVERSITY ANNUR LAMPUNG	1994-11-15	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-28 05:55:25.2	2025-09-28 05:55:25.2	1149
269	Osman Çiçek	osmancicek358@gmail.com	Mersin, Turkey	Turkish	\N	+905378721493	Alanya Alaaddin Keykubat University	2005-01-19	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-28 07:53:15.411	2025-09-28 07:53:15.411	1152
270	Muhammad Danish Bin Mohd Fadhlan	danishfadhlan06@gmail.com	Subang Jaya, Malaysia	Malaysian	-	+60132606991	UiTM Segamat	2006-02-07	MALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-28 09:34:21.847	2025-09-28 09:34:21.847	1155
271	Leny Indah Sari	contact.lenyindah@gmail.com	Jakarta, Indonesia	Indonesia	\N	+6281325747577	PT. Hilal Mitra Perkasa	1995-03-17	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-28 09:37:14.445	2025-09-28 09:37:14.445	1156
272	Aisha Sandu	aisha.sandu123@gmail.com	Coventry, England, UK 	British 	N/A	+4407400791419	University of Warwick 	2003-11-25	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-28 15:59:38.927	2025-09-28 15:59:38.927	1170
274	Ayu Cahyani	ayucahyyani@gmail.com	Bandung, Indonesia	Indonesia	-	+6285335834945	Bandung Institute of Technology	2003-01-16	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-28 17:27:37.382	2025-09-28 17:27:37.382	1174
275	PHEARA TEP	teppheara12@gmail.com	Phnom Penh, Cambodia 	Cambodia	\N	+85581621182	Institute Pasteur du Cambodge 	1998-06-01	MALE	FRIENDS	\N	FULLY_FUNDED	2025-09-28 18:58:27.288	2025-09-28 18:58:27.288	1177
276	Skkdjsd	nsnsjsjsjs@gmail.com	Snxnnx	Xxbbx	Xbxnx	+77780580818	Xnnxx	2009-09-20	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-28 19:40:56.665	2025-09-28 19:40:56.665	1178
277	Adis Rachmania Nurjannah	adisrachmania20@gmail.com	Surabaya, Indonesia	Indonesian	\N	+6282141853989	BINUS University 	2002-08-24	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-29 01:36:20.377	2025-09-29 01:36:20.377	1184
278	Mengly Chhorm	menglychhorm112@gmail.com	Cambodia	Cambodian	\N	+85589742247	Royal university of law and economics 	2003-06-08	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-29 05:26:31.935	2025-09-29 05:26:31.935	1198
279	Mazhitkhanov Abylay Bolatovich	abylay.mazhitkhan@gmail.com	Kazakhstan, Almaty	Kazakhstan	\N	+77479952915	Tamos education (school)	1995-10-05	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-29 05:40:25.883	2025-09-29 05:40:25.883	1201
280	SAM ROTH	rothkhemara012@gmail.com	Kampong Thom province.	Cambodian	No	+85593528900	Teacher, teaching in Reaksmey Sophornna High School, Stoung district, Kampong Thom province, Cambodia.	1991-09-03	MALE	OTHER	Telegram community group	FULLY_FUNDED	2025-09-29 07:44:21.026	2025-09-29 07:44:21.026	1208
281	Thitsanapat Siwarattanan	thitsanapat@gmail.com	Bangkok, Thailand	Thai	\N	+66965760649	King Mongkut's Institute of Technology Ladkrabang	2004-09-10	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-29 07:52:20.216	2025-09-29 07:52:20.216	1200
282	Charlotte Davies	charlidavies@icloud.com	Australia	Australian	\N	+61491763123	University of Melbourne	2005-01-06	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-29 08:47:56.435	2025-09-29 08:47:56.435	1210
284	Pech Sovan	pech.sovan.arc@gmail.com	Phnom Penh	Cambodia	\N	+85599946638	CamTech University / Cambodia Speech and Debate Association (Work Place)	2006-11-10	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-29 10:02:01.753	2025-09-29 10:02:01.753	1216
286	Birimkul kyzy Makhabat 	birimkulovamahabat17@xmail.ru	China/ Liaoning Province/ Shenyang city ( at the moment)	Kyrgyz 	\N	+996709068449	Liaoning University of Petroleum and Chemical Technology	2001-09-14	FEMALE	OTHER	Telegram 	FULLY_FUNDED	2025-09-29 11:17:54.265	2025-09-29 11:17:54.265	1225
287	Headangelly Huy	hheadamgelly@gmail.com	PHNOM PENH	Cambodia	\N	+855973173189	Paragon International University	2004-01-30	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-29 11:27:01.581	2025-09-29 11:27:01.581	1228
288	Haidar Hasna Romiiza	haidarhasnaromiiza@gmail.com	KABUPATEN KUDUS	INDONESIA	-	+6288806254749	DIPONEGORO UNIVERSITY	2004-05-18	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-29 13:02:26.18	2025-09-29 13:02:26.18	1234
289	Victoria Shevchenko 	shevchenkovika01@gmail.com	Ukraine, Lviv	Ukrainian	\N	+380678640104	The Lviv Polytechnic National University	2005-12-10	FEMALE	OTHER	Telegram	FULLY_FUNDED	2025-09-29 13:30:35.422	2025-09-29 13:30:35.422	1237
290	Asylzat Akjoltoeva 	Asylzat.569@gmail.com	Bishkek, Kyrgyzstan 	Kyrgyzstan 	\N	+996505543434	American University of Central Asia 	2002-04-20	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-29 13:58:02.864	2025-09-29 13:58:02.864	1239
291	arkansyah farras setiawan	arkansyahid2910@gmail.com	Tangerang, Indonesia	Indonesia	\N	+6285776073529	Department of Public Works, Spatial Planning, and Land Affairs of Jakarta Government	1998-10-29	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-29 15:24:40.36	2025-09-29 15:24:40.36	1249
292	Maulidah Nur Rizka	maulidahnurrizka@gmail.com	Bandung, Indonesia	Warga Negara Indonesia	\N	+6285357678071	Bandung Institute of Technolog	2000-06-10	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-29 15:39:42.616	2025-09-29 15:39:42.616	1252
293	Zhanerke Seisenbay	zhanerkeseisenbai04@gmail.com	Rome, Italy	Kazakh	\N	+77768198785	Sapienza University of Rome	2004-11-02	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-29 16:10:48.247	2025-09-29 16:10:48.247	1255
294	Beby Bisyara	bebybisyara1207@gmail.com	Tasikmalaya, Indonesia	Indonesia	\N	+6282119294545	PT Ashiato Boga Gemilang	2003-07-12	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-29 16:51:23.418	2025-09-29 16:51:23.418	1260
295	Hilola Rustamova	hilolarustamova1808@gmail.com	Andijan, Uzbekistan	Uzbek	\N	+998947004494	Tashkent Pharmaceutical Institute	2004-08-18	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-29 17:59:19.015	2025-09-29 17:59:19.015	1263
296	Tasbia Uddin	tasbiauddin@gmail.com	Lexington, United States	United States	\N	+16179062322	Brandeis University	2007-04-01	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-29 19:51:46.242	2025-09-29 19:51:46.242	1266
297	Valaysia Smith	valaysia.smith@gmail.com	Monroe, LA, USA	American	\N	13184505004	Louisiana Delta Community College	2006-04-17	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-30 01:56:31.875	2025-09-30 01:56:31.875	1278
298	Sri Balasubramaniyam Subramaniam	sribalasubramaniyam@gmail.com	PELABUHAN KLANG	Bbssn	Njj	04946944494	Ehej	2001-09-30	MALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 01:59:31.008	2025-09-30 01:59:31.008	1279
299	Fery Manggala Riyanto	ferymanggala@gmail.com	Bandung, Indonesia (ID)	Indonesian	\N	+6281313114440	Parahyangan Catholic University	2004-01-15	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 02:03:15.25	2025-09-30 02:03:15.25	1280
300	Ángel Sebastián González Bermúdez	asebastiangb@gmail.com	Monterrey, México	Mexican	\N	+522221395250	Instituto Tecnológico y de Estudios Superiores de Monterrey	2002-10-07	MALE	FRIENDS	\N	FULLY_FUNDED	2025-09-30 02:03:22.415	2025-09-30 02:03:22.415	1282
301	Fellya Kayla Laffaiza	fellyakayla_21@icloud.com	Semarang, Indonesia	Indonesia	\N	81386747920	Diponegoro University	2005-05-21	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 05:05:36.729	2025-09-30 05:05:36.729	1299
302	Siti Halimah Indrani Anwar	siti.halimah@aiesec.net	Daejeon, South Korea	Indonesia	\N	+6287880834903	Korean Advanced Institute of Science and Technology/Universitas Indonesia	2025-06-19	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 05:54:35.258	2025-09-30 05:54:35.258	1303
303	Muhammad Osmar Zaidan Al Wafi	osmarzdn@gmail.com	Banjarbaru	Indonesia	\N	+6282157277993	Universitas Lambung Mangkurat	2004-12-05	MALE	FRIENDS	\N	FULLY_FUNDED	2025-09-30 06:00:33.579	2025-09-30 06:00:33.579	1306
305	Nov Sokhema 	novsokhema168@gmail.com	Phnom Penh 	Khmer 	No 	+85512242689	National bank of Cambodia 	1998-05-11	FEMALE	OTHER	Facebook 	FULLY_FUNDED	2025-09-30 08:21:29.477	2025-09-30 08:21:29.477	1317
306	Sarah Fahira Faza	faahirafaza@gmail.com	Jakarta, Indonesia	Indonesian	\N	+6285159915250	Universitas Indonesia	2003-06-15	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 08:32:51.445	2025-09-30 08:32:51.445	1318
307	Vonley W. Smith	vonleyvws@gmail.com	Bridgetown, Barbados	Barbadian	Trinidadian	18683054129	VWS Studios	1991-03-31	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 08:34:21.351	2025-09-30 08:34:21.351	1313
308	Nurhan Raihan	nurhan.mohd.edu@gmail.com	Singapore, Singapore	Singaporean	\N	451289774	The Australian National University	1997-01-09	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 08:57:00.258	2025-09-30 08:57:00.258	1321
309	Htet Ko Lwin	htetkolwin72@gmail.com	Korat, Nakhon Ratchasima, Thailand	Myanmar	\N	+959441811200	Suranaree University of Technology, Thailand	2004-02-07	MALE	OTHER	Facebook	FULLY_FUNDED	2025-09-30 09:37:32.826	2025-09-30 09:37:32.826	1325
310	Kartika Ratih Nurdiyana	kartikanurdiyana@gmail.com	Semarang, Indonesia	Indonesia	\N	+6287870897346	Diponegoro University	2004-09-15	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 09:39:46.96	2025-09-30 09:39:46.96	1326
311	Htet Ko Lwin	htetkolwin72@gmail.com	Korat, Nakhon Ratchasima, Thailand	Myanmar	\N	+959441811200	Suranaree University of Technology, Thailand	2004-02-07	MALE	OTHER	Facebook	FULLY_FUNDED	2025-09-30 09:52:04.271	2025-09-30 09:52:04.271	1329
312	Sumaiya Tarique Labiba	labibatarique@gmail.com	Dhaka, Bangladesh	Bangladeshi	\N	+8801401061071	BRAC University	1999-12-27	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 09:54:35.127	2025-09-30 09:54:35.127	1323
313	Aung Bhone Thant	66011631@kmitl.ac.th	Bangkok,Thailand 	Myanmar 	\N	0965764273	King Mongkut’s Institute of Technology Ladkrabang 	2006-08-27	MALE	FRIENDS	\N	FULLY_FUNDED	2025-09-30 10:03:53.431	2025-09-30 10:03:53.431	1331
314	Ravydo Anggara Jufri	ravydo123@gmail.com	Larantuka, East Nusa Tenggara	Indonesia	\N	+6289621421053	Indonesian Agency for Meteorological Climatological and Geophysics (BMKG)	2000-03-30	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 10:15:20.569	2025-09-30 10:15:20.569	1332
315	KINZA JAWWAD	kinzajawwad0100@gmail.com	Karachi	Pakistan	\N	+923123330333	The Coca-Cola Company	1995-05-08	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 11:33:32.895	2025-09-30 11:33:32.895	1341
316	SAFRINA PUTRI INDIRA	safrina.putri24@gmail.com	SIDOARJO	Indonesia	-	+6281231384446	Airlangga University	2005-03-06	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 11:53:28.706	2025-09-30 11:53:28.706	1344
317	Viky Zahra Nabilah	vikycipo17@gmail.com	Kendal, Indonesia	Indonesian	\N	+6285290839264	Doctor	2001-02-04	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 12:31:04.082	2025-09-30 12:31:04.082	1345
318	Niqa Nabila Nur Ihsani	niqanabila06@gmail.com	West Bandung Regency	Indonesia	\N	+6285221752429	Bandung State Polytechnic	2003-11-16	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 12:40:59.403	2025-09-30 12:40:59.403	1350
319	Nabilah Aisyah Masbuchin	nabilahmasbuchin246@gmail.com	Surabaya, Indonesia	Indonesia	\N	+6288805507035	Airlangga University	2003-08-01	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-30 12:41:39.687	2025-09-30 12:41:39.687	1352
320	Nguyen Thi Minh Anh	ngminhanh2910@gmail.com	Hanoi	Vietnamese	\N	+84372315198	National Economics University 	2004-10-29	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 12:48:06.546	2025-09-30 12:48:06.546	1354
321	Nguyen Thi Minh Anh	ngminhanh2910@gmail.com	Hanoi	Vietnamese	\N	+84372315198	National Economics University (university) - German Corporation for International Cooperation (GIZ) (work place)	2004-10-29	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 13:16:16.28	2025-09-30 13:16:16.28	1358
322	Rachata Suesat	rachata_s@sepo.go.th	Laksi	Thailand	\N	+66959159654	State Enterprise Policy  Office	1993-08-30	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 13:31:14.12	2025-09-30 13:31:14.12	1359
323	Christian Julius Wijaya	christian_wijaya@ukwms.ac.id	Surabaya, Indonesia	Indonesia	\N	+6281336699907	Widya Mandala Surabaya Catholic University	1995-07-19	MALE	FRIENDS	\N	FULLY_FUNDED	2025-09-30 13:44:18.062	2025-09-30 13:44:18.062	1361
324	Nguyen Thi Minh Anh	ngminhanh2910@gmail.com	Hanoi	Vietnamese	\N	+84372315198	National Economics University (university) - German Corporation for International Cooperation (GIZ) (work place)	2004-10-29	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 13:57:37.603	2025-09-30 13:57:37.603	1362
325	Palupi Wilda Utami	palupi.wilda@gmail.com	Bekasi	Indonesia	\N	+6281513941525	Universitas Indonesia 	2004-01-06	FEMALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 14:05:52.861	2025-09-30 14:05:52.861	1363
326	PEH HANLI	hanlipeh2308@gmail.com	Kuala Lumpur, Malaysia	Malaysian	-	+60122832653	National University of Malaysia (UKM)	2003-08-23	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 14:24:23.045	2025-09-30 14:24:23.045	1367
327	RABIATUL INSYIRAH MOHD RIDZUWAN	rabiatulinsyirahmohdridzuwan@gmail.com	SELANGOR	Malaysia	\N	+60182818186	UNIVERSITI TEKNOLOGI MARA	2004-10-10	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 14:25:33.495	2025-09-30 14:25:33.495	1366
328	Nguyen Thuy Duong	duong13042001@gmail.com	Hanoi, Vietnam	Vietnamese	\N	+84961732395	Lotus Technology Services Group	2001-04-13	FEMALE	FRIENDS	\N	FULLY_FUNDED	2025-09-30 14:43:44.498	2025-09-30 14:43:44.498	1371
329	Zarina Rafgatova	rafgatovaz@gmail.com	Daejeon	Kazakhstan	\N	+821068949960	Woosong University (Endicott College of International Studies), South Korea	2003-09-04	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 15:00:30.644	2025-09-30 15:00:30.644	1374
330	Rabina Abdrakhmanova	rabina.abdrakhmanova@gmail.com	Astana, Kazakhstan	Kazakhstan	\N	+77015171588	Ecole Polytechnique (Institut Polytechnique de Paris)	2000-02-09	FEMALE	OTHER_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 15:40:29.069	2025-09-30 15:40:29.069	1376
331	Ogilvy Galang Rizki	ogilvy111@gmail.com	Yogyakarta, Indonesia	Indonesia	\N	082299911646	Gadjah Mada University	2001-08-21	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2025-09-30 15:45:23.067	2025-09-30 15:45:23.067	1377
332	Umar Sani	umarsani361@gmail.com	Pekalongan, Indonesia	Indonesia	\N	+6289603219442	Devsite	2000-02-16	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2026-02-27 19:29:46.229	2026-02-27 19:29:46.229	1380
333	Umar Sani	umarsani361@gmail.com	Pekalongan, Indonesia	Indonesia	\N	+6289603219442	Devsite	2000-02-16	MALE	RISE_INSTAGRAM	\N	FULLY_FUNDED	2026-02-27 19:31:40.326	2026-02-27 19:31:40.326	1381
\.


--
-- Data for Name: ryls_self_funded_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ryls_self_funded_submissions (id, registration_id, passport_number, need_visa, headshot_file_id, read_policies, created_at) FROM stdin;
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_settings (id, key, value, description, created_at, updated_at) FROM stdin;
1	linkedin_sync_filters	{"type_filter": [], "industry_filter": [], "location_filter": [], "seniority_filter": [], "description_filter": ["sustainability", "environmental", "renewable", "esg", "gri", "carbon", "green", "waste"], "advanced_title_filter": [], "organization_description_filter": [], "organization_specialties_filter": []}	Default filters for manual LinkedIn sync	2025-09-29 19:18:40.018	2025-09-29 19:18:40.018
2	linkedin_rate_limit	{"jobs": {"limit": 250, "reset": 2109676, "remaining": 230}, "requests": {"limit": 25, "reset": 2109676, "remaining": 7}, "last_updated": "2025-09-29T19:18:43.842Z"}	LinkedIn API rate limit data	2025-09-29 19:18:43.845	2025-09-29 19:18:43.845
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.testimonials (id, name, country, text, rating, status, featured, created_at, updated_at) FROM stdin;
1	Annisa Faradila	Indonesia	I am very grateful to Rise Social for this trip. Here's to future reunions and the continued success and expansion of the Rise ASEAN Leaders Summit.	5	ACTIVE	t	2025-07-23 00:42:47.176	2025-07-23 00:42:47.176
2	Muhammad Zuhry	Indonesia	Thank you Rise Social for bring up my childhood memories in a very prestigious way. I learned a lot about disaster and also the meaning of life	5	ACTIVE	t	2025-07-23 00:42:47.176	2025-07-23 00:42:47.176
3	Oualid Abbane	Algeria	Rise Social makes me want visit Japan again and again and give motivation and support, it's totally new journey and life learning experience	5	ACTIVE	t	2025-07-23 00:42:47.176	2025-07-23 00:42:47.176
4	Aaron Alexander	Indonesia	THANK YOU VERY MUCH FOR THE BEST STUDY TRIP I'VE EVER EXPERIENCED IN MY LIFE ! WHAT A REMARKABLE EXPERIENCE! ^^	5	ACTIVE	t	2025-07-23 00:42:47.176	2025-07-23 00:42:47.176
5	Nisrina Amalia C.	Indonesia	Very good topic and insights from the lecturer. great job, Rise Social. Looking forward for another journey with you!	5	ACTIVE	t	2025-07-23 00:42:47.176	2025-07-23 00:42:47.176
6	Alvin Rajendra Rabani	Indonesia	You're all great people doing great things. Keep doing what you do best and don't forget your friend here! Hope can jump in another session.	5	ACTIVE	t	2025-07-23 00:42:47.176	2025-07-23 00:42:47.176
\.


--
-- Data for Name: user_saved_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_saved_jobs (user_id, job_id, saved_at, id) FROM stdin;
\.


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_settings (id, user_id, created_at, updated_at, key, value) FROM stdin;
60	60	2026-03-02 04:18:51.351	2026-03-02 04:18:51.351	notification_preferences	{"job_notification": true, "promo_notification": true, "program_notification": true}
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, first_name, last_name, avatar, email, phone, password, email_verified_at, phone_verified_at, role, gender, country, province, city, last_education, current_job, current_company, skills, created_at, updated_at) FROM stdin;
2	demo	Demo	User	https://i.pravatar.cc/150?u=demo@risesocial.org	demo@risesocial.org	+62-812-3456-7893	$2b$12$S954Vq08gSgrUytUOWoTkeijwcfht1jZlbPJQ6cPOfpK9vvOaSE4i	2025-07-23 00:42:46.755	\N	USER	MALE	Indonesia	Jawa Barat	Bandung	S1 Computer Science	Software Developer	Software House	{JavaScript,Node.js,React,Vue.js,PostgreSQL}	2025-07-23 00:42:46.766	2025-07-23 00:42:46.766
4	saskashafirarizkia	Saska Shafira	Rizkia	\N	saskashariz@gmail.com	\N	$2b$12$.UfGoaCKjI6lvdYB7sY3i.3c/5fgK0YL4.35u04fHrMqfy.LCHjSm	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-01 13:36:17.262	2025-08-01 13:36:17.262
5	hilmifarrel	Hilmi	Farrel	\N	hilmifarrel03@gmail.com	\N	$2b$12$QZhx8iZADwP2JyfdhRgBK.WZwycMlqI66gZZuZ.ATsPKBw9yBqC3W	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-02 06:42:25.438	2025-08-02 06:42:25.438
6	azizanurulamanah	Aziza Nurul	Amanah	\N	azraalamanah88@gmail.com	\N	$2b$12$5TMUfO3w8FEawexNbnFfPOEIeCdbDoP4x3eGqZyKSM44cyQ/VfBym	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-04 16:51:30.677	2025-08-04 16:51:30.677
7	davidgreeley	david	greeley	\N	david_greeley@yahoo.com	\N	$2b$12$6z4cdpM9cyeYf4M1lSw65eKNrj8js0aF52K02xTNbz3jjaq7vrFxS	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-05 07:28:17.241	2025-08-05 07:28:17.241
8	hafinurhabibahabiba	Hafi Nur Habiba	Habiba	\N	habibahafi141@gmail.com	\N	$2b$12$KkbnxgoerCKgzaZgl3x.BuRFsN6ORwM5EB663LZfDsBjAo2jGQBQ2	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-06 01:31:58.993	2025-08-06 01:31:58.993
9	muhammaddaffarachman	Muhammad	Daffarachman	\N	mhmdfidara@gmail.com	\N	$2b$12$okj9Dgnow545Yr4hTUXV7OL/sLBhRLCm6comnPTMy38/s/z3IatV.	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-06 07:18:19.611	2025-08-06 07:18:19.611
10	danielharun	Daniel	Harun	\N	daniel.harun2001@gmail.com	\N	$2b$12$R9y4BmZ1tgn1743gMjCoQ.iu.kgLp3modq2KBnsvvp/Kr/mDZpL2u	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-06 09:29:38.898	2025-08-06 09:29:38.898
11	oualidabbane	Oualid	Abbane	\N	abbane.oualid@gmail.com	\N	$2b$12$3dl3gOa/n2vrlnvMHjrO.ux0.gzRgfmEfnZcFd58dARSML6yOqe7q	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-06 11:52:51.763	2025-08-06 11:52:51.763
13	salvaaleuwolaleu	Salva Aleu Wol 	Aleu 	\N	aleuwol12@gmail.com	\N	$2b$12$0gBhOlx/RGPfcB8m7Yl6duiZYTrdwE8YSVq2cXhMVCk7d5hdAbbom	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-09 23:25:55.459	2025-08-09 23:25:55.459
14	tannyaaulika	Tannya	Aulika	\N	delacourtannya@gmail.com	\N	$2b$12$i4CJxEOEqeQi4fmHUhpZAupLng.yHtszlY3bOprGtyqXGUz/QeOHm	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-12 10:13:04.478	2025-08-12 10:13:04.478
26	rezaabdullah	Reza	Abdullah	\N	bsse1335@iit.du.ac.bd	\N	$2b$12$lSlEzeTOmSW..UKqNhLY1enBFNHrJDB.y5s93p8aOHg7mxzfYMWy6	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-20 16:09:05.099	2025-08-20 16:09:05.099
16	madihaazeem	Madiha	Azeem	\N	azeemmadiha41@gmail.com	\N	$2b$12$Y1QHDuwVw/4z8uXIsIPkxOt1CCGb5vu18gby2Q6XtvLDHdlsPjmVa	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-15 19:41:58.915	2025-08-15 19:41:58.915
17	sharvenraj	sharven	raj	\N	sharven.sr@gmail.com	\N	$2b$12$nh/qQbRH/hnZenZAs3ZyKOkfSk63MYt2Q9amh0SYSVOkw5sFQ9AJ.	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-16 16:45:19.174	2025-08-16 16:45:19.174
18	idayussriyani	Ida yus	Sriyani	\N	idayussriyani@gmail.com	\N	$2b$12$Q6EXuCHp6NvOsqNBJ6L.u.5Y3OJSGFgAUWjOT5KqX6ywMsOp1Nwj.	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-16 16:50:13.923	2025-08-16 16:50:13.923
19	fauziseptriantoro	Fauzi	Septriantoro	\N	septriantorof@gmail.com	\N	$2b$12$tXgDhndgnZvMxblJzboKV.lI7k39iGREeC/t7uO6ZJXpAz7/WeziC	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-16 17:03:04.921	2025-08-16 17:03:04.921
20	auderlyyodo	Auderly	Yodo	\N	auderlyyodo@gmail.com	\N	$2b$12$w/BXljm.aVqgxEsi041VLOea59pIKrVGqL5zLPuvY7eOjKrdgnknG	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-16 17:59:27.223	2025-08-16 17:59:27.223
21	andrihimawan	Andri	Himawan	\N	andrihmw1004@gmail.com	\N	$2b$12$AYKc.RaTddGprBWvRYCNbO.tGyIC4tDa8MDEuQxKQUoD6XUNaTOnm	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-18 05:40:53.712	2025-08-18 05:40:53.712
22	niningwahyuni	NINING	WAHYUNI	\N	niningwahyuni97@gmail.com	\N	$2b$12$uiWKvHd4xvbYhpw/ANWziOtETZS2abq3q3819DVGG9IfwAbNWM1Hu	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-18 15:37:27.361	2025-08-18 15:37:27.361
23	dhitaanindyaparamitha	Dhita Anindya 	Paramitha	\N	paramithadhitaanindya@gmail.com	\N	$2b$12$nmjkcJaSkj4twGAqaHT4X.KzaKOjrhKWDHQy2LsmARPNVzUZstdHi	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-19 12:47:48.623	2025-08-19 12:47:48.623
24	amrullahamrullah	Amrullah	Amrullah	\N	amrullahsh1@gmail.com	\N	$2b$12$OlhB5z.YHDsDaH6uXmb7F.HK0FMjpB5rz3uUxFXAglP8talM9FqD6	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-19 14:31:10.354	2025-08-19 14:31:10.354
25	matteodavanzo	Matteo	Davanzo	\N	matteodavanzo24@gmail.com	\N	$2b$12$KOqucrOOPeps2nb/Cq5ZLeLeGlHsIbIR/UdQUESXvWjX.wc23SRc2	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-20 14:40:19.205	2025-08-20 14:40:19.205
27	zhafifzoraabdullah	Zhafif Zora 	Abdullah	\N	reizaifafu@gmail.com	\N	$2b$12$4XzJa9nsND6e6xnC.ceuqOx.OEabN2RotKW.O/oedJTTuv3mKMa8m	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-21 16:20:03.344	2025-08-21 16:20:03.344
28	ayucahyani	Ayu	Cahyani	\N	ayucahyyani@gmail.com	\N	$2b$12$kcWSMNxQio/3Q/.4rZD78O5yuEUqTH2CwNu6bJKSt0qTdYlwkEXDK	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-24 07:37:27.881	2025-08-24 07:37:27.881
29	imranfarishtaufiqbinmuhammadzubairy	Imran Farish 	Taufiq Bin Muhammad Zubairy 	\N	imranikan88rising@icloud.com	\N	$2b$12$DxvgQMYfZfsvHGDNQKpeZ.T2Kfn5L8al4t2tzBszvbLw5xpjBtNR6	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-24 14:35:08.817	2025-08-24 14:35:08.817
30	sarinanajafi	Sarina	Najafi	\N	sarinanajafibns@gmail.com	\N	$2b$12$FjAzT5AQJCOpXbrLGEbcz.vKTQCpbiVrZADqUBHGTCVw3ofNGZ25K	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-25 08:56:51.009	2025-08-25 08:56:51.009
31	adiyatpermana	Adiyat	Permana	\N	kuda.perang.xxx@gmail.com	\N	$2b$12$Jv/aPSu80SuX80G6HfLxDue8LC6UEafqAkrqaD69iVNo/O5fuwNwa	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-27 03:26:08.48	2025-08-27 03:26:08.48
32	naufalnadhif	Naufal	Nadhif	\N	naufalnadhif737900@gmail.com	\N	$2b$12$d.fqxVQSK7h42uqYWMX4TeLO4OGPleZJDOQ7QWdoQmd9BWfHBnZmK	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-27 06:44:52.508	2025-08-27 06:44:52.508
33	florensiashiely	Florensia	Shiely	\N	florensiashiely.yp@gmail.com	\N	$2b$12$yYF7xFImqCwjdpkA.jkfd.WvGjs25QyuZme5Q9863mMLv3SJ4xqRO	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-27 14:53:52.989	2025-08-27 14:53:52.989
34	saifulimran	Saiful	imran 	\N	saifulsaifullah25@gmail.com	\N	$2b$12$ivw6vv4HU/lL0BFlxZDYMO3SjqA8vI5OI8ReVCiFBFiIg1Wnst./W	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-28 01:15:05.236	2025-08-28 01:15:05.236
35	kiffaazzahra	Kiffa	Azzahra	\N	kiffanandra@gmail.com	\N	$2b$12$K9ED6Gfgj0n59Q1yqgdFeeXpdwi9LsxEaU3yLpy4Kx03hYVxEKmDq	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-28 02:04:46.054	2025-08-28 02:04:46.054
36	riskisetiabudi	Riski	Setiabudi	\N	riskisetiabudi13@gmail.com	\N	$2b$12$wmEHXdocN6nejyMIR0mab.P8MCEwdOtzKzq9eVX3xmxNXTlmrDj.i	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-28 11:51:59.51	2025-08-28 11:51:59.51
37	angelinakhitrova	ANGELINA	KHITROVA	\N	DILL3657@GMAIL.COM	\N	$2b$12$BNRsL.Jdg/h4F/FrafnIN.O.knlZtQj5vGMjSPCLyZUzZYgiBILTe	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-30 12:12:14.062	2025-08-30 12:12:14.062
38	aryasatyawiryawan	Aryasatya	Wiryawan	\N	aryasatyapark@gmail.com	\N	$2b$12$EMc0EgZTnmQx5h33b4TXIehIwc7UOThg88f8TcZ4VFJPLlH15nG1C	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-31 04:42:45.886	2025-08-31 04:42:45.886
39	muhammadadib	muhammad	Adib	\N	adib7027@gmail.com	\N	$2b$12$Bos0l4vlj02NTSo9wVngC.27dZYKnX6snSKPxSHbomN1B0KyaN.h2	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-01 00:58:07.782	2025-09-01 00:58:07.782
40	abdulmajidshagali	Abdulmajid	Shagali	\N	aashagali@163.com	\N	$2b$12$gKmuDM9yLuxGUvZnFuLFG.DoK23KlGiHjyP7EjDX1/UiKxlTVQVdW	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-02 11:19:29.195	2025-09-02 11:19:29.195
41	muhammadyusrinaimbinmohdyusof	Muhammad Yusri Naim	bin Mohd Yusof	\N	yusrinaim97@gmail.com	\N	$2b$12$okD3dlQ6DQ4L.OWZ/.F8ieILGJ/CUm5fxSnF6nguZICd6QbqKRDoC	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-03 09:50:42.241	2025-09-03 09:50:42.241
12	umarsani	Umar 	S	\N	umarsani361@gmail.com	\N	$2b$12$aScfDuBc3g701OB.dEmu..Z9VnRxkx.L4LSv.hEbTnVLel3AKuiiC	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-08 11:39:50.61	2025-08-08 11:39:50.61
42	maarijshamim	Maarij	Shamim	\N	maarij.shamim3@gmail.com	\N	$2b$12$AUtuEJ7zAykCIEO3D1SK8.yqsQckZAUIB8Xq7jvhtEckCABthmzKG	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-07 16:37:59.214	2025-09-07 16:37:59.214
43	ahadinfahmiskmmkkk	Ahadin	Fahmi, SKM, M.KKK	\N	fahmiadimara.project@gmail.com	\N	$2b$12$szpieJGIfg5gIIS1zwzjyuCEmEwLR0dJnI/fk5uO7Iy//W3.SFsiC	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-08 07:10:49.987	2025-09-08 07:10:49.987
44	riskisetiabudi1	Riski	Setiabudi	\N	riskisetiabudi22@gmail.com	\N	$2b$12$wKVLTO8AuJ29mqEug8kbSu/0Ze09JQiqsA19MEN8a4wK3h5j39Kiy	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-08 10:25:48.191	2025-09-08 10:25:48.191
45	tseringgaphel	TSERING	GAPHEL	\N	gaphelkuri900@gmail.com	\N	$2b$12$VaDhdHltVG/g0.VUA0mIou8bysmT8YVROPpjr7/gSCVmADpbnYi.q	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-08 17:50:13.512	2025-09-08 17:50:13.512
46	anahitmnatsakanyan	Anahit	Mnatsakanyan	\N	anahitmnatsakanyan68@gmail.com	\N	$2b$12$kWEqdgwS6N2czBecOPQ1Jeqrk6Rg/K5KrCDsS6Zg4ez9BLt0YDDsO	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-13 07:02:59.804	2025-09-13 07:02:59.804
47	qonitasalma	Qonita	Salma	\N	qonitasalma1864@gmail.com	\N	$2b$12$BAWhnolj3Le.y5P5EEQ8ke1R0MY0ptjSTgRn7KNqeUS0P86wjb4hC	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-16 05:38:27.18	2025-09-16 05:38:27.18
48	fridayosemeha	Friday	Osemeha	\N	royalk117@yahoo.com	\N	$2b$12$4tEyJK9EgSooPu6liQ1WAeeyvsEUZZICyCZE8Y0kvOiF6Ldtr2QBW	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-22 06:46:18.891	2025-09-22 06:46:18.891
49	dominicnorton	Dominic	Norton	\N	dominiconorton@gmail.com	\N	$2b$12$pZcFlXrRBOw9HkhOqVyM8ukRFygQyn7Hs5lAlp3qz1tLOJabjyHaW	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-22 09:31:45.046	2025-09-22 09:31:45.046
50	alyssavallejos	Alyssa	Vallejos	\N	alyssavallejos1004@gmail.com	\N	$2b$12$BfRWrwKWEUBpqiaWt6lXU.658Ar4XMxW5DukF.e/ekC94702r9pd2	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-24 08:48:53.926	2025-09-24 08:48:53.926
51	christianjuliuswijaya	Christian Julius	Wijaya	\N	christian_wijaya@ukwms.ac.id	\N	$2b$12$r/6AD1H7jFca.iL7URLR/ekkQMBDQCst.qZexhyXhoXkJEe5NY5lu	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-25 07:07:50.262	2025-09-25 07:07:50.262
52	muhammadsheraz	Muhammad	Sheraz	\N	muhammadsheraz@ipe.ac.cn	\N	$2b$12$8eRDUYsOxYoikKCeG0vKBe1X9OQrCt8rrL/oCVCwp41AyEh2gxO.K	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-27 11:24:16.131	2025-09-27 11:24:16.131
53	nadyaramadani	Nadya	Ramadani	\N	nadyanisfi0710@gmail.com	\N	$2b$12$j5twZxWcA8fkBB2oNO.OY.mTlW3u8QDoTZ7g2JiRemRcCovLIhKpK	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-27 13:45:12.311	2025-09-27 13:45:12.311
54	lukmaniarramadhani	LUKMANIAR	RAMADHANI	\N	lukmaniarramadani@gmail.com	\N	$2b$12$5OaHIKqRFERVgLdsce2dx.UdF2n.sCA2OuKG3pQNDLvZDNpTJnyPC	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-28 05:37:37.43	2025-09-28 05:37:37.43
55	rafirajibsa	Rafi	Rajibsa	\N	rafirajibsa@gmail.com	\N	$2b$12$698/UvgEvykO8kWKisJbZ.QaDWBN4tZczAvjR0PXvHOqCKYX/lYau	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-28 11:29:20.193	2025-09-28 11:29:20.193
56	adistysalsabilacandra	adisty	salsabila candra	\N	adistysalsabilacandra@gmail.com	\N	$2b$12$N/VskJCmKAJqkFJQEdcANOS3b1x2O1z9yq6d14fonJDcEk27Npfvm	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-29 04:13:42.785	2025-09-29 04:13:42.785
57	zahrazulfiaananta	Zahra	Zulfia Ananta	\N	zahrazulfiaaya@gmail.com	\N	$2b$12$XxDw3ft/ROhxZt2G01EjCuJwBl4inxJ.VS8lA2MUuOEx0AFbJPRye	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-29 09:22:00.188	2025-09-29 09:22:00.188
58	krisnaramadhan	Krisna	Ramadhan	\N	krisna.rmdhn111@gmail.com	\N	$2b$12$1LKuf..SX3SEmyqJbcCZU.n7Q7QYq1Wa6jDQtc858VL4EIvi2NnBa	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-29 09:33:28.441	2025-09-29 09:33:28.441
59	pechsovan	Pech	Sovan	\N	pech.sovan.arc@gmail.com	\N	$2b$12$v853keYVi7l3/It.Wx.OPOxVhJg.wW9x9qxpq5HG/1NGbYNyUwQ0u	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-29 09:54:04.886	2025-09-29 09:54:04.886
1	admin	Admin	Rise	https://api.risesocial.org/uploads/images/1759171725540-Frame 62 (1).jpg	admin@risesocial.org	+62-812-3456-7890	$2b$12$DdsdT5IUDFnTwCWjYRbbiOP1NV/.qJ8gW4XGDowe.BF9nc//qAnfK	2025-07-23 00:42:46.755	2025-07-23 00:42:46.755	ADMIN	MALE	Indonesia	Jawa Barat	Bandung	S1 Computer Science	System Administrator	Rise Social	{Leadership,Management,"System Administration","Database Management"}	2025-07-23 00:42:46.766	2025-09-29 18:48:45.628
60	testtest	test	test	\N	test@example.com	08123456789	$2b$12$6odbR1pIQtlO2UPGc.4tc.eczLAQH/nTsuS/22Wx5CtaQnx//Ps/a	\N	\N	USER	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-02 04:18:51.329	2026-03-02 04:18:51.329
\.


--
-- Name: academies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.academies_id_seq', 4, true);


--
-- Name: academy_enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.academy_enrollments_id_seq', 1, false);


--
-- Name: academy_faqs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.academy_faqs_id_seq', 14, true);


--
-- Name: academy_features_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.academy_features_id_seq', 31, true);


--
-- Name: academy_instructors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.academy_instructors_id_seq', 6, true);


--
-- Name: academy_pricing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.academy_pricing_id_seq', 8, true);


--
-- Name: academy_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.academy_sessions_id_seq', 25, true);


--
-- Name: academy_testimonials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.academy_testimonials_id_seq', 9, true);


--
-- Name: academy_topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.academy_topics_id_seq', 6, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.companies_id_seq', 21, true);


--
-- Name: file_uploads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.file_uploads_id_seq', 328, true);


--
-- Name: job_ai_insights_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_ai_insights_id_seq', 18, true);


--
-- Name: job_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_applications_id_seq', 1, false);


--
-- Name: job_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_locations_id_seq', 5, true);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 26, true);


--
-- Name: midtrans_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.midtrans_payments_id_seq', 1247, true);


--
-- Name: programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.programs_id_seq', 3, true);


--
-- Name: ryls_fully_funded_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ryls_fully_funded_submissions_id_seq', 332, true);


--
-- Name: ryls_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ryls_payments_id_seq', 1381, true);


--
-- Name: ryls_registrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ryls_registrations_id_seq', 333, true);


--
-- Name: ryls_self_funded_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ryls_self_funded_submissions_id_seq', 1, true);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 2, true);


--
-- Name: testimonials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.testimonials_id_seq', 6, true);


--
-- Name: user_saved_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_saved_jobs_id_seq', 1, false);


--
-- Name: user_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_settings_id_seq', 60, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 60, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: academies academies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academies
    ADD CONSTRAINT academies_pkey PRIMARY KEY (id);


--
-- Name: academy_enrollments academy_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_enrollments
    ADD CONSTRAINT academy_enrollments_pkey PRIMARY KEY (id);


--
-- Name: academy_faqs academy_faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_faqs
    ADD CONSTRAINT academy_faqs_pkey PRIMARY KEY (id);


--
-- Name: academy_features academy_features_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_features
    ADD CONSTRAINT academy_features_pkey PRIMARY KEY (id);


--
-- Name: academy_instructors academy_instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_instructors
    ADD CONSTRAINT academy_instructors_pkey PRIMARY KEY (id);


--
-- Name: academy_pricing academy_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_pricing
    ADD CONSTRAINT academy_pricing_pkey PRIMARY KEY (id);


--
-- Name: academy_sessions academy_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_sessions
    ADD CONSTRAINT academy_sessions_pkey PRIMARY KEY (id);


--
-- Name: academy_testimonials academy_testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_testimonials
    ADD CONSTRAINT academy_testimonials_pkey PRIMARY KEY (id);


--
-- Name: academy_topics academy_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_topics
    ADD CONSTRAINT academy_topics_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: file_uploads file_uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_uploads
    ADD CONSTRAINT file_uploads_pkey PRIMARY KEY (id);


--
-- Name: job_ai_insights job_ai_insights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_ai_insights
    ADD CONSTRAINT job_ai_insights_pkey PRIMARY KEY (id);


--
-- Name: job_applications job_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_pkey PRIMARY KEY (id);


--
-- Name: job_locations job_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_locations
    ADD CONSTRAINT job_locations_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: midtrans_payments midtrans_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.midtrans_payments
    ADD CONSTRAINT midtrans_payments_pkey PRIMARY KEY (id);


--
-- Name: programs programs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (id);


--
-- Name: ryls_fully_funded_submissions ryls_fully_funded_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ryls_fully_funded_submissions
    ADD CONSTRAINT ryls_fully_funded_submissions_pkey PRIMARY KEY (id);


--
-- Name: ryls_payments ryls_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ryls_payments
    ADD CONSTRAINT ryls_payments_pkey PRIMARY KEY (id);


--
-- Name: ryls_registrations ryls_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ryls_registrations
    ADD CONSTRAINT ryls_registrations_pkey PRIMARY KEY (id);


--
-- Name: ryls_self_funded_submissions ryls_self_funded_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ryls_self_funded_submissions
    ADD CONSTRAINT ryls_self_funded_submissions_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: user_saved_jobs user_saved_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_saved_jobs
    ADD CONSTRAINT user_saved_jobs_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: academies_category_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academies_category_status_idx ON public.academies USING btree (category, status);


--
-- Name: academies_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academies_created_at_idx ON public.academies USING btree (created_at DESC);


--
-- Name: academies_path_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academies_path_slug_idx ON public.academies USING btree (path_slug);


--
-- Name: academies_path_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX academies_path_slug_key ON public.academies USING btree (path_slug);


--
-- Name: academies_rating_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academies_rating_idx ON public.academies USING btree (rating DESC);


--
-- Name: academies_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academies_status_idx ON public.academies USING btree (status);


--
-- Name: academy_enrollments_academy_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academy_enrollments_academy_id_idx ON public.academy_enrollments USING btree (academy_id);


--
-- Name: academy_enrollments_enrolled_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academy_enrollments_enrolled_at_idx ON public.academy_enrollments USING btree (enrolled_at DESC);


--
-- Name: academy_enrollments_enrollment_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academy_enrollments_enrollment_status_idx ON public.academy_enrollments USING btree (enrollment_status);


--
-- Name: academy_enrollments_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academy_enrollments_user_id_idx ON public.academy_enrollments USING btree (user_id);


--
-- Name: academy_faqs_academy_id_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academy_faqs_academy_id_order_idx ON public.academy_faqs USING btree (academy_id, "order");


--
-- Name: academy_features_academy_id_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academy_features_academy_id_order_idx ON public.academy_features USING btree (academy_id, "order");


--
-- Name: academy_instructors_academy_id_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academy_instructors_academy_id_order_idx ON public.academy_instructors USING btree (academy_id, "order");


--
-- Name: academy_instructors_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academy_instructors_name_idx ON public.academy_instructors USING btree (name);


--
-- Name: academy_pricing_academy_id_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academy_pricing_academy_id_order_idx ON public.academy_pricing USING btree (academy_id, "order");


--
-- Name: academy_sessions_topic_id_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academy_sessions_topic_id_order_idx ON public.academy_sessions USING btree (topic_id, "order");


--
-- Name: academy_testimonials_academy_id_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academy_testimonials_academy_id_order_idx ON public.academy_testimonials USING btree (academy_id, "order");


--
-- Name: academy_topics_academy_id_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX academy_topics_academy_id_order_idx ON public.academy_topics USING btree (academy_id, "order");


--
-- Name: companies_industry_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX companies_industry_idx ON public.companies USING btree (industry);


--
-- Name: companies_linkedin_employees_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX companies_linkedin_employees_idx ON public.companies USING btree (linkedin_employees);


--
-- Name: companies_linkedin_size_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX companies_linkedin_size_idx ON public.companies USING btree (linkedin_size);


--
-- Name: companies_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX companies_slug_key ON public.companies USING btree (slug);


--
-- Name: file_uploads_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX file_uploads_created_at_idx ON public.file_uploads USING btree (created_at DESC);


--
-- Name: file_uploads_upload_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX file_uploads_upload_type_idx ON public.file_uploads USING btree (upload_type);


--
-- Name: job_ai_insights_ai_experience_level_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX job_ai_insights_ai_experience_level_idx ON public.job_ai_insights USING btree (ai_experience_level);


--
-- Name: job_ai_insights_ai_salary_min_value_ai_salary_max_value_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX job_ai_insights_ai_salary_min_value_ai_salary_max_value_idx ON public.job_ai_insights USING btree (ai_salary_min_value, ai_salary_max_value);


--
-- Name: job_ai_insights_ai_work_arrangement_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX job_ai_insights_ai_work_arrangement_idx ON public.job_ai_insights USING btree (ai_work_arrangement);


--
-- Name: job_ai_insights_job_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX job_ai_insights_job_id_key ON public.job_ai_insights USING btree (job_id);


--
-- Name: job_applications_job_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX job_applications_job_id_idx ON public.job_applications USING btree (job_id);


--
-- Name: job_applications_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX job_applications_status_idx ON public.job_applications USING btree (status);


--
-- Name: job_applications_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX job_applications_user_id_idx ON public.job_applications USING btree (user_id);


--
-- Name: job_applications_user_id_job_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX job_applications_user_id_job_id_key ON public.job_applications USING btree (user_id, job_id);


--
-- Name: job_locations_city_region_country_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX job_locations_city_region_country_key ON public.job_locations USING btree (city, region, country);


--
-- Name: job_locations_country_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX job_locations_country_idx ON public.job_locations USING btree (country);


--
-- Name: job_locations_is_remote_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX job_locations_is_remote_idx ON public.job_locations USING btree (is_remote);


--
-- Name: job_locations_latitude_longitude_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX job_locations_latitude_longitude_idx ON public.job_locations USING btree (latitude, longitude);


--
-- Name: jobs_company_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_company_id_idx ON public.jobs USING btree (company_id);


--
-- Name: jobs_company_id_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX jobs_company_id_slug_key ON public.jobs USING btree (company_id, slug);


--
-- Name: jobs_employment_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_employment_type_idx ON public.jobs USING btree (employment_type);


--
-- Name: jobs_location_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_location_id_idx ON public.jobs USING btree (location_id);


--
-- Name: jobs_posted_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_posted_date_idx ON public.jobs USING btree (posted_date DESC);


--
-- Name: jobs_seniority_level_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_seniority_level_idx ON public.jobs USING btree (seniority_level);


--
-- Name: jobs_source_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_source_idx ON public.jobs USING btree (source);


--
-- Name: midtrans_payments_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX midtrans_payments_order_id_idx ON public.midtrans_payments USING btree (order_id);


--
-- Name: midtrans_payments_order_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX midtrans_payments_order_id_key ON public.midtrans_payments USING btree (order_id);


--
-- Name: midtrans_payments_transaction_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX midtrans_payments_transaction_status_idx ON public.midtrans_payments USING btree (transaction_status);


--
-- Name: programs_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX programs_slug_idx ON public.programs USING btree (slug);


--
-- Name: programs_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX programs_slug_key ON public.programs USING btree (slug);


--
-- Name: programs_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX programs_status_idx ON public.programs USING btree (status);


--
-- Name: ryls_fully_funded_submissions_essay_file_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ryls_fully_funded_submissions_essay_file_id_idx ON public.ryls_fully_funded_submissions USING btree (essay_file_id);


--
-- Name: ryls_fully_funded_submissions_essay_file_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ryls_fully_funded_submissions_essay_file_id_key ON public.ryls_fully_funded_submissions USING btree (essay_file_id);


--
-- Name: ryls_fully_funded_submissions_registration_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ryls_fully_funded_submissions_registration_id_idx ON public.ryls_fully_funded_submissions USING btree (registration_id);


--
-- Name: ryls_fully_funded_submissions_registration_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ryls_fully_funded_submissions_registration_id_key ON public.ryls_fully_funded_submissions USING btree (registration_id);


--
-- Name: ryls_payments_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ryls_payments_created_at_idx ON public.ryls_payments USING btree (created_at DESC);


--
-- Name: ryls_payments_midtrans_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ryls_payments_midtrans_id_key ON public.ryls_payments USING btree (midtrans_id);


--
-- Name: ryls_payments_payment_proof_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ryls_payments_payment_proof_id_key ON public.ryls_payments USING btree (payment_proof_id);


--
-- Name: ryls_payments_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ryls_payments_status_idx ON public.ryls_payments USING btree (status);


--
-- Name: ryls_payments_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ryls_payments_type_idx ON public.ryls_payments USING btree (type);


--
-- Name: ryls_registrations_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ryls_registrations_created_at_idx ON public.ryls_registrations USING btree (created_at DESC);


--
-- Name: ryls_registrations_ryls_payment_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ryls_registrations_ryls_payment_id_idx ON public.ryls_registrations USING btree (ryls_payment_id);


--
-- Name: ryls_registrations_scholarship_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ryls_registrations_scholarship_type_idx ON public.ryls_registrations USING btree (scholarship_type);


--
-- Name: ryls_self_funded_submissions_headshot_file_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ryls_self_funded_submissions_headshot_file_id_idx ON public.ryls_self_funded_submissions USING btree (headshot_file_id);


--
-- Name: ryls_self_funded_submissions_headshot_file_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ryls_self_funded_submissions_headshot_file_id_key ON public.ryls_self_funded_submissions USING btree (headshot_file_id);


--
-- Name: ryls_self_funded_submissions_registration_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ryls_self_funded_submissions_registration_id_idx ON public.ryls_self_funded_submissions USING btree (registration_id);


--
-- Name: ryls_self_funded_submissions_registration_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ryls_self_funded_submissions_registration_id_key ON public.ryls_self_funded_submissions USING btree (registration_id);


--
-- Name: system_settings_key_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX system_settings_key_idx ON public.system_settings USING btree (key);


--
-- Name: system_settings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX system_settings_key_key ON public.system_settings USING btree (key);


--
-- Name: testimonials_country_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX testimonials_country_idx ON public.testimonials USING btree (country);


--
-- Name: testimonials_featured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX testimonials_featured_idx ON public.testimonials USING btree (featured);


--
-- Name: testimonials_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX testimonials_status_idx ON public.testimonials USING btree (status);


--
-- Name: uk_enrollment_user_academy; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uk_enrollment_user_academy ON public.academy_enrollments USING btree (academy_id, user_id);


--
-- Name: user_saved_jobs_job_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_saved_jobs_job_id_idx ON public.user_saved_jobs USING btree (job_id);


--
-- Name: user_saved_jobs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_saved_jobs_user_id_idx ON public.user_saved_jobs USING btree (user_id);


--
-- Name: user_saved_jobs_user_id_job_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_saved_jobs_user_id_job_id_key ON public.user_saved_jobs USING btree (user_id, job_id);


--
-- Name: user_settings_key_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_settings_key_idx ON public.user_settings USING btree (key);


--
-- Name: user_settings_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_settings_user_id_idx ON public.user_settings USING btree (user_id);


--
-- Name: user_settings_user_id_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_settings_user_id_key_key ON public.user_settings USING btree (user_id, key);


--
-- Name: users_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_created_at_idx ON public.users USING btree (created_at DESC);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: users_username_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_username_idx ON public.users USING btree (username);


--
-- Name: academy_enrollments academy_enrollments_academy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_enrollments
    ADD CONSTRAINT academy_enrollments_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: academy_enrollments academy_enrollments_pricing_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_enrollments
    ADD CONSTRAINT academy_enrollments_pricing_tier_id_fkey FOREIGN KEY (pricing_tier_id) REFERENCES public.academy_pricing(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: academy_enrollments academy_enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_enrollments
    ADD CONSTRAINT academy_enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: academy_faqs academy_faqs_academy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_faqs
    ADD CONSTRAINT academy_faqs_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: academy_features academy_features_academy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_features
    ADD CONSTRAINT academy_features_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: academy_instructors academy_instructors_academy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_instructors
    ADD CONSTRAINT academy_instructors_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: academy_pricing academy_pricing_academy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_pricing
    ADD CONSTRAINT academy_pricing_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: academy_sessions academy_sessions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_sessions
    ADD CONSTRAINT academy_sessions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.academy_topics(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: academy_testimonials academy_testimonials_academy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_testimonials
    ADD CONSTRAINT academy_testimonials_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: academy_topics academy_topics_academy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academy_topics
    ADD CONSTRAINT academy_topics_academy_id_fkey FOREIGN KEY (academy_id) REFERENCES public.academies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: job_ai_insights job_ai_insights_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_ai_insights
    ADD CONSTRAINT job_ai_insights_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: job_applications job_applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: job_applications job_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: jobs jobs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: jobs jobs_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.job_locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ryls_fully_funded_submissions ryls_fully_funded_submissions_essay_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ryls_fully_funded_submissions
    ADD CONSTRAINT ryls_fully_funded_submissions_essay_file_id_fkey FOREIGN KEY (essay_file_id) REFERENCES public.file_uploads(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ryls_fully_funded_submissions ryls_fully_funded_submissions_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ryls_fully_funded_submissions
    ADD CONSTRAINT ryls_fully_funded_submissions_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.ryls_registrations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ryls_payments ryls_payments_midtrans_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ryls_payments
    ADD CONSTRAINT ryls_payments_midtrans_id_fkey FOREIGN KEY (midtrans_id) REFERENCES public.midtrans_payments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ryls_payments ryls_payments_payment_proof_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ryls_payments
    ADD CONSTRAINT ryls_payments_payment_proof_id_fkey FOREIGN KEY (payment_proof_id) REFERENCES public.file_uploads(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ryls_payments ryls_payments_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ryls_payments
    ADD CONSTRAINT ryls_payments_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.ryls_registrations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ryls_self_funded_submissions ryls_self_funded_submissions_headshot_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ryls_self_funded_submissions
    ADD CONSTRAINT ryls_self_funded_submissions_headshot_file_id_fkey FOREIGN KEY (headshot_file_id) REFERENCES public.file_uploads(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ryls_self_funded_submissions ryls_self_funded_submissions_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ryls_self_funded_submissions
    ADD CONSTRAINT ryls_self_funded_submissions_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.ryls_registrations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_saved_jobs user_saved_jobs_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_saved_jobs
    ADD CONSTRAINT user_saved_jobs_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_saved_jobs user_saved_jobs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_saved_jobs
    ADD CONSTRAINT user_saved_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_settings user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

