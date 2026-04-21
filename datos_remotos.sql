SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict A5ewLsuHBA9UbbuLfuMnWuRkyWmUahgY2em6zeKEGsshKBg5MWb6dAMESn6taLt

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'a7dac9e2-27eb-452a-b22b-a3ec5a1c2337', 'authenticated', 'authenticated', 'antofassina4020@gmail.com', '$2a$10$dVJK9bakGQMgiCAkxed59OuVHvcWuZOQwM7rtU8kbtA514dlo6fOe', '2026-04-12 20:19:50.769023+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-12 20:22:15.253718+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "a7dac9e2-27eb-452a-b22b-a3ec5a1c2337", "email": "antofassina4020@gmail.com", "full_name": "Antonella Fassina", "is_university": true, "email_verified": true, "phone_verified": false}', NULL, '2026-04-12 20:19:50.688821+00', '2026-04-12 20:22:15.257574+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'e563fb25-f0e3-4bab-ad2f-17b0d7090c60', 'authenticated', 'authenticated', 'correodelucas@gmail.com', '$2a$10$YZfqdxkXM6EZHEBK4K7mrOXPBmD.XCi9t.fiTxvEsT.t3K.5PwLce', '2026-02-21 20:52:31.948344+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-21 21:21:36.758248+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "e563fb25-f0e3-4bab-ad2f-17b0d7090c60", "email": "correodelucas@gmail.com", "full_name": "Lucas Benitez", "email_verified": true, "phone_verified": false}', NULL, '2026-02-21 20:52:31.932398+00', '2026-02-21 21:21:36.801313+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '85920cf2-206d-4d85-bebe-2b10ad1e663f', 'authenticated', 'authenticated', 'ferpiva4@hotmail.com', '$2a$10$ls.EisK99PNOoavezwPWjOH6aaHKdc6Q267KolDaxSkB/ESYIQora', '2026-04-08 05:09:46.464213+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-08 05:09:46.484289+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "85920cf2-206d-4d85-bebe-2b10ad1e663f", "email": "ferpiva4@hotmail.com", "full_name": "Fer Piva", "is_university": true, "email_verified": true, "phone_verified": false}', NULL, '2026-04-08 05:09:46.375037+00', '2026-04-08 05:09:46.524701+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4d52ee9e-b631-44b8-815f-681b6a56eec3', 'authenticated', 'authenticated', 'usuario@gmail.com', '$2a$10$GdeeZWVm9phhLZMycg6fZ.rT4VMpDTJVLmjNVNbuXghWTP9i2pwfW', '2026-02-16 23:32:34.057389+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-16 23:32:34.067426+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "4d52ee9e-b631-44b8-815f-681b6a56eec3", "email": "usuario@gmail.com", "full_name": "pruebausuario", "email_verified": true, "phone_verified": false}', NULL, '2026-02-16 23:32:34.018546+00', '2026-02-16 23:32:34.079701+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a78aeb6e-4b28-4562-b33e-69bee9ff287d', 'authenticated', 'authenticated', 'melisab.martinez@gmail.com', '$2a$10$IpEGyWdspyNtXZIshQplwuqwREYRGwOyIgL.RZw2poyWFTvqEZ2sW', '2026-02-21 22:38:47.394307+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-21 22:38:47.422381+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "a78aeb6e-4b28-4562-b33e-69bee9ff287d", "email": "melisab.martinez@gmail.com", "full_name": "Melisa Martinez ", "email_verified": true, "phone_verified": false}', NULL, '2026-02-21 22:38:47.325209+00', '2026-02-23 02:26:05.545532+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5bbe1655-25ba-46e2-9d85-5cc097d1a5a2', 'authenticated', 'authenticated', 'julianboninifotos@gmail.com', '$2a$10$GnhUTbhxfNV6V1LpSHt55eBD5J681WMq/ixTurS5QCk3587uv/w4G', '2026-04-07 19:36:53.286962+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-07 19:54:52.658363+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "5bbe1655-25ba-46e2-9d85-5cc097d1a5a2", "email": "julianboninifotos@gmail.com", "full_name": "Julian Bonini", "is_university": true, "email_verified": true, "phone_verified": false}', NULL, '2026-04-07 19:36:53.207029+00', '2026-04-07 19:54:52.663188+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '973d642b-c4ce-4bc1-b9b6-41cb159d699c', 'authenticated', 'authenticated', 'anitamigni@gmail.com', '$2a$10$ptB.oUZXRIrN4J2XSozeKu2V.P.a908PSvAkW.jtJXzZhLo5olNGi', '2026-02-21 22:38:50.310812+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-02-21 22:38:50.31841+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "973d642b-c4ce-4bc1-b9b6-41cb159d699c", "email": "anitamigni@gmail.com", "full_name": "ANABELLA MIGNINO ", "email_verified": true, "phone_verified": false}', NULL, '2026-02-21 22:38:50.300102+00', '2026-02-21 22:38:50.321348+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c5d6b1ec-3e15-4d87-b11b-52f9d5d3454a', 'authenticated', 'authenticated', 'asd@asd.com', '$2a$10$Lql7rlOd5N469LMK8DHL7ubaj3Ck/1V3ZuLpZOEQRJMM3CUAZHK/2', '2026-03-24 19:07:09.607202+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-03-24 19:12:01.476134+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "c5d6b1ec-3e15-4d87-b11b-52f9d5d3454a", "email": "asd@asd.com", "full_name": "sdfsdf", "is_university": true, "email_verified": true, "phone_verified": false}', NULL, '2026-03-24 19:07:09.561618+00', '2026-03-24 19:12:01.480731+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '71306ed0-8484-46de-8a00-d81cf58a5847', 'authenticated', 'authenticated', 'elfomauri@gmail.com', '$2a$10$st9729.xRvzk2jpXLAkHauJk/AqMYp3GMRNJoLpaDGNVdqia7IC0e', '2026-02-21 20:47:36.388564+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-04-02 13:19:48.92073+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "71306ed0-8484-46de-8a00-d81cf58a5847", "email": "elfomauri@gmail.com", "full_name": "Mauricio Fassina", "email_verified": true, "phone_verified": false}', NULL, '2026-02-21 20:47:36.339135+00', '2026-04-14 22:56:24.583316+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '08c75dfe-9643-4861-b48b-31da73ad46ec', 'authenticated', 'authenticated', 'darioanzaudo@gmail.com', '$2a$10$sZYJ/vE.BpVYFYvIDwVmCOjlY/bqOE4eTabXjL8oDFGX0Z7Y0i3Wq', '2026-02-16 18:05:48.822077+00', NULL, '', '2026-02-02 21:17:03.180224+00', '', NULL, '', '', NULL, '2026-04-19 14:05:14.767152+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "08c75dfe-9643-4861-b48b-31da73ad46ec", "email": "darioanzaudo@gmail.com", "full_name": "dario", "email_verified": true, "phone_verified": false}', NULL, '2026-02-02 21:17:03.12452+00', '2026-04-19 14:05:14.825264+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('08c75dfe-9643-4861-b48b-31da73ad46ec', '08c75dfe-9643-4861-b48b-31da73ad46ec', '{"sub": "08c75dfe-9643-4861-b48b-31da73ad46ec", "email": "darioanzaudo@gmail.com", "full_name": "dario", "email_verified": false, "phone_verified": false}', 'email', '2026-02-02 21:17:03.162579+00', '2026-02-02 21:17:03.16322+00', '2026-02-02 21:17:03.16322+00', 'cf3444a5-cd07-466e-934a-dba665c79c7e'),
	('4d52ee9e-b631-44b8-815f-681b6a56eec3', '4d52ee9e-b631-44b8-815f-681b6a56eec3', '{"sub": "4d52ee9e-b631-44b8-815f-681b6a56eec3", "email": "usuario@gmail.com", "full_name": "pruebausuario", "email_verified": false, "phone_verified": false}', 'email', '2026-02-16 23:32:34.045693+00', '2026-02-16 23:32:34.045765+00', '2026-02-16 23:32:34.045765+00', '1497799d-9e94-49a5-974b-a64237ca8ccb'),
	('71306ed0-8484-46de-8a00-d81cf58a5847', '71306ed0-8484-46de-8a00-d81cf58a5847', '{"sub": "71306ed0-8484-46de-8a00-d81cf58a5847", "email": "elfomauri@gmail.com", "full_name": "Mauricio Fassina", "email_verified": false, "phone_verified": false}', 'email', '2026-02-21 20:47:36.377868+00', '2026-02-21 20:47:36.377927+00', '2026-02-21 20:47:36.377927+00', 'c76f1d43-1bd6-4273-a95c-cf9699e7ef74'),
	('e563fb25-f0e3-4bab-ad2f-17b0d7090c60', 'e563fb25-f0e3-4bab-ad2f-17b0d7090c60', '{"sub": "e563fb25-f0e3-4bab-ad2f-17b0d7090c60", "email": "correodelucas@gmail.com", "full_name": "Lucas Benitez", "email_verified": false, "phone_verified": false}', 'email', '2026-02-21 20:52:31.945012+00', '2026-02-21 20:52:31.945057+00', '2026-02-21 20:52:31.945057+00', 'af2a1247-87e6-4086-97b1-39da0790b51d'),
	('a78aeb6e-4b28-4562-b33e-69bee9ff287d', 'a78aeb6e-4b28-4562-b33e-69bee9ff287d', '{"sub": "a78aeb6e-4b28-4562-b33e-69bee9ff287d", "email": "melisab.martinez@gmail.com", "full_name": "Melisa Martinez ", "email_verified": false, "phone_verified": false}', 'email', '2026-02-21 22:38:47.378033+00', '2026-02-21 22:38:47.378688+00', '2026-02-21 22:38:47.378688+00', '96058699-180b-46c1-baa5-6d3a2fd50c74'),
	('973d642b-c4ce-4bc1-b9b6-41cb159d699c', '973d642b-c4ce-4bc1-b9b6-41cb159d699c', '{"sub": "973d642b-c4ce-4bc1-b9b6-41cb159d699c", "email": "anitamigni@gmail.com", "full_name": "ANABELLA MIGNINO ", "email_verified": false, "phone_verified": false}', 'email', '2026-02-21 22:38:50.306223+00', '2026-02-21 22:38:50.306269+00', '2026-02-21 22:38:50.306269+00', '11197f92-31e7-4f2a-adbd-ff49c5dc541b'),
	('c5d6b1ec-3e15-4d87-b11b-52f9d5d3454a', 'c5d6b1ec-3e15-4d87-b11b-52f9d5d3454a', '{"sub": "c5d6b1ec-3e15-4d87-b11b-52f9d5d3454a", "email": "asd@asd.com", "full_name": "sdfsdf", "is_university": true, "email_verified": false, "phone_verified": false}', 'email', '2026-03-24 19:07:09.596928+00', '2026-03-24 19:07:09.596984+00', '2026-03-24 19:07:09.596984+00', '7f2f09eb-b2cf-4ec8-9a25-277dbd704305'),
	('5bbe1655-25ba-46e2-9d85-5cc097d1a5a2', '5bbe1655-25ba-46e2-9d85-5cc097d1a5a2', '{"sub": "5bbe1655-25ba-46e2-9d85-5cc097d1a5a2", "email": "julianboninifotos@gmail.com", "full_name": "Julian Bonini", "is_university": true, "email_verified": false, "phone_verified": false}', 'email', '2026-04-07 19:36:53.276246+00', '2026-04-07 19:36:53.276298+00', '2026-04-07 19:36:53.276298+00', 'f3d55d73-0cd2-4be1-92db-6c26232ec54d'),
	('85920cf2-206d-4d85-bebe-2b10ad1e663f', '85920cf2-206d-4d85-bebe-2b10ad1e663f', '{"sub": "85920cf2-206d-4d85-bebe-2b10ad1e663f", "email": "ferpiva4@hotmail.com", "full_name": "Fer Piva", "is_university": true, "email_verified": false, "phone_verified": false}', 'email', '2026-04-08 05:09:46.456203+00', '2026-04-08 05:09:46.456251+00', '2026-04-08 05:09:46.456251+00', 'ce786666-25e9-4304-8aac-94af6ccb3106'),
	('a7dac9e2-27eb-452a-b22b-a3ec5a1c2337', 'a7dac9e2-27eb-452a-b22b-a3ec5a1c2337', '{"sub": "a7dac9e2-27eb-452a-b22b-a3ec5a1c2337", "email": "antofassina4020@gmail.com", "full_name": "Antonella Fassina", "is_university": true, "email_verified": false, "phone_verified": false}', 'email', '2026-04-12 20:19:50.760585+00', '2026-04-12 20:19:50.760639+00', '2026-04-12 20:19:50.760639+00', 'd98d2c89-24a5-4135-a767-bfdac786cb4a');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('20de354d-787c-4dfc-b574-0a5879140ed4', '08c75dfe-9643-4861-b48b-31da73ad46ec', '2026-04-19 14:05:14.767473+00', '2026-04-19 14:05:14.767473+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '190.194.170.210', NULL, NULL, NULL, NULL, NULL),
	('33cfbd6c-cc7e-44cf-8900-f859a8aa3d12', '5bbe1655-25ba-46e2-9d85-5cc097d1a5a2', '2026-04-07 19:36:53.311282+00', '2026-04-07 19:36:53.311282+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/29.0 Chrome/136.0.0.0 Mobile Safari/537.36', '201.235.202.216', NULL, NULL, NULL, NULL, NULL),
	('f9da7bf7-5666-4de0-b615-34dce635d780', '5bbe1655-25ba-46e2-9d85-5cc097d1a5a2', '2026-04-07 19:54:51.552427+00', '2026-04-07 19:54:51.552427+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/29.0 Chrome/136.0.0.0 Mobile Safari/537.36', '201.235.202.216', NULL, NULL, NULL, NULL, NULL),
	('f54aac1f-6cbb-4499-9a03-df449213e697', '5bbe1655-25ba-46e2-9d85-5cc097d1a5a2', '2026-04-07 19:54:52.658455+00', '2026-04-07 19:54:52.658455+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/29.0 Chrome/136.0.0.0 Mobile Safari/537.36', '201.235.202.216', NULL, NULL, NULL, NULL, NULL),
	('015ecabd-8acf-4ae7-af8f-8461a7e31fb5', '973d642b-c4ce-4bc1-b9b6-41cb159d699c', '2026-02-21 22:38:50.318496+00', '2026-02-21 22:38:50.318496+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36', '190.16.130.147', NULL, NULL, NULL, NULL, NULL),
	('513d772c-425b-460f-9906-8506c518190c', '85920cf2-206d-4d85-bebe-2b10ad1e663f', '2026-04-08 05:09:46.484396+00', '2026-04-08 05:09:46.484396+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1', '186.127.37.24', NULL, NULL, NULL, NULL, NULL),
	('e97c65c5-623f-4fbe-a2d6-26c99b91e481', '71306ed0-8484-46de-8a00-d81cf58a5847', '2026-04-02 13:13:26.503246+00', '2026-04-12 18:21:44.04534+00', NULL, 'aal1', NULL, '2026-04-12 18:21:44.045228', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', '181.81.4.253', NULL, NULL, NULL, NULL, NULL),
	('d3bcf711-26c3-4503-9998-0b21e8e8e1d1', 'a7dac9e2-27eb-452a-b22b-a3ec5a1c2337', '2026-04-12 20:19:50.787343+00', '2026-04-12 20:19:50.787343+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', '181.85.184.16', NULL, NULL, NULL, NULL, NULL),
	('2d94e1e8-53a2-467c-a901-793491b5d4c4', 'a7dac9e2-27eb-452a-b22b-a3ec5a1c2337', '2026-04-12 20:22:15.253808+00', '2026-04-12 20:22:15.253808+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', '181.85.184.16', NULL, NULL, NULL, NULL, NULL),
	('6189aeee-4ebb-4080-afcf-74a4545785df', '71306ed0-8484-46de-8a00-d81cf58a5847', '2026-04-02 13:19:48.920831+00', '2026-04-14 22:56:24.594916+00', NULL, 'aal1', NULL, '2026-04-14 22:56:24.594811', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '190.16.130.147', NULL, NULL, NULL, NULL, NULL),
	('401ce2e8-9d55-4fb8-adec-dfdd8725c5a3', '08c75dfe-9643-4861-b48b-31da73ad46ec', '2026-03-31 18:46:38.254058+00', '2026-04-18 21:28:29.501435+00', NULL, 'aal1', NULL, '2026-04-18 21:28:29.50133', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '181.9.227.103', NULL, NULL, NULL, NULL, NULL),
	('5bc7f88e-69a6-4185-934e-c1bbbd6600aa', 'a78aeb6e-4b28-4562-b33e-69bee9ff287d', '2026-02-21 22:38:47.424241+00', '2026-02-23 02:26:05.558582+00', NULL, 'aal1', NULL, '2026-02-23 02:26:05.557455', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '45.225.214.84', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('5bc7f88e-69a6-4185-934e-c1bbbd6600aa', '2026-02-21 22:38:47.451142+00', '2026-02-21 22:38:47.451142+00', 'password', '4ccbd4f5-de5b-4c3e-9c55-e7436c69181c'),
	('015ecabd-8acf-4ae7-af8f-8461a7e31fb5', '2026-02-21 22:38:50.321633+00', '2026-02-21 22:38:50.321633+00', 'password', '9c134dca-3b59-45cf-82a2-83a9cdaa2019'),
	('401ce2e8-9d55-4fb8-adec-dfdd8725c5a3', '2026-03-31 18:46:38.317901+00', '2026-03-31 18:46:38.317901+00', 'password', '636b7c25-3cdf-4d0c-990a-05dd8d72d802'),
	('e97c65c5-623f-4fbe-a2d6-26c99b91e481', '2026-04-02 13:13:26.518452+00', '2026-04-02 13:13:26.518452+00', 'password', '35e7386f-09b1-4f50-9b14-81f6af839162'),
	('6189aeee-4ebb-4080-afcf-74a4545785df', '2026-04-02 13:19:48.981691+00', '2026-04-02 13:19:48.981691+00', 'password', '53aadf5d-f7a6-4da4-8987-73889a71070d'),
	('33cfbd6c-cc7e-44cf-8900-f859a8aa3d12', '2026-04-07 19:36:53.359551+00', '2026-04-07 19:36:53.359551+00', 'password', 'c3279768-1af2-4d42-b3be-f8d68b878b1c'),
	('f9da7bf7-5666-4de0-b615-34dce635d780', '2026-04-07 19:54:51.613018+00', '2026-04-07 19:54:51.613018+00', 'password', 'c2d4f7c8-7e80-48cf-b508-16409c2f77b1'),
	('f54aac1f-6cbb-4499-9a03-df449213e697', '2026-04-07 19:54:52.663521+00', '2026-04-07 19:54:52.663521+00', 'password', 'aa742943-7239-483f-994e-36d3789a4c26'),
	('513d772c-425b-460f-9906-8506c518190c', '2026-04-08 05:09:46.525244+00', '2026-04-08 05:09:46.525244+00', 'password', '12b73439-11a6-4fb2-a121-55d2206e5c4a'),
	('d3bcf711-26c3-4503-9998-0b21e8e8e1d1', '2026-04-12 20:19:50.805972+00', '2026-04-12 20:19:50.805972+00', 'password', '594ed2b4-0c8d-415c-b61c-dfcd80b6c2b1'),
	('2d94e1e8-53a2-467c-a901-793491b5d4c4', '2026-04-12 20:22:15.260183+00', '2026-04-12 20:22:15.260183+00', 'password', '7402bdac-4dd0-4e1d-8a4e-c477bfa065de'),
	('20de354d-787c-4dfc-b574-0a5879140ed4', '2026-04-19 14:05:14.830051+00', '2026-04-19 14:05:14.830051+00', 'password', 'a7c60c3c-a251-4229-9335-31994d37a91b');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 147, '2owozjxsdtda', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-02 22:23:54.998313+00', '2026-04-02 23:22:23.241472+00', 'wczbafa6sc7p', '6189aeee-4ebb-4080-afcf-74a4545785df'),
	('00000000-0000-0000-0000-000000000000', 145, 'bdmayrjlpva7', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-02 14:41:32.788815+00', '2026-04-03 02:04:50.677021+00', 'jazamipq6cph', 'e97c65c5-623f-4fbe-a2d6-26c99b91e481'),
	('00000000-0000-0000-0000-000000000000', 150, 'ae4r5polrzvj', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-05 19:02:45.066601+00', '2026-04-07 13:26:48.904078+00', 'cxlegen25ecj', 'e97c65c5-623f-4fbe-a2d6-26c99b91e481'),
	('00000000-0000-0000-0000-000000000000', 148, 'aphp3yhp5hpw', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-02 23:22:23.264158+00', '2026-04-07 13:39:33.480797+00', '2owozjxsdtda', '6189aeee-4ebb-4080-afcf-74a4545785df'),
	('00000000-0000-0000-0000-000000000000', 44, '7aqdvl5pahox', '973d642b-c4ce-4bc1-b9b6-41cb159d699c', false, '2026-02-21 22:38:50.320462+00', '2026-02-21 22:38:50.320462+00', NULL, '015ecabd-8acf-4ae7-af8f-8461a7e31fb5'),
	('00000000-0000-0000-0000-000000000000', 154, '7ss4zdtu3cxm', '5bbe1655-25ba-46e2-9d85-5cc097d1a5a2', false, '2026-04-07 19:54:51.592849+00', '2026-04-07 19:54:51.592849+00', NULL, 'f9da7bf7-5666-4de0-b615-34dce635d780'),
	('00000000-0000-0000-0000-000000000000', 155, '2yikf2hwlkz2', '5bbe1655-25ba-46e2-9d85-5cc097d1a5a2', false, '2026-04-07 19:54:52.660896+00', '2026-04-07 19:54:52.660896+00', NULL, 'f54aac1f-6cbb-4499-9a03-df449213e697'),
	('00000000-0000-0000-0000-000000000000', 152, '6dfatejd7lwj', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-07 13:39:33.508467+00', '2026-04-07 21:50:01.000556+00', 'aphp3yhp5hpw', '6189aeee-4ebb-4080-afcf-74a4545785df'),
	('00000000-0000-0000-0000-000000000000', 157, 'b62lpunoud7c', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-07 23:12:27.535988+00', '2026-04-08 00:13:24.722946+00', '6nm775g4o6wz', 'e97c65c5-623f-4fbe-a2d6-26c99b91e481'),
	('00000000-0000-0000-0000-000000000000', 43, 'teizxztltope', 'a78aeb6e-4b28-4562-b33e-69bee9ff287d', true, '2026-02-21 22:38:47.433006+00', '2026-02-21 23:40:58.822656+00', NULL, '5bc7f88e-69a6-4185-934e-c1bbbd6600aa'),
	('00000000-0000-0000-0000-000000000000', 159, 'qr2lljignnly', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-08 00:13:24.734728+00', '2026-04-08 05:11:24.843598+00', 'b62lpunoud7c', 'e97c65c5-623f-4fbe-a2d6-26c99b91e481'),
	('00000000-0000-0000-0000-000000000000', 161, 'g7z344bjmn2g', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-08 05:11:24.846661+00', '2026-04-10 18:25:59.06761+00', 'qr2lljignnly', 'e97c65c5-623f-4fbe-a2d6-26c99b91e481'),
	('00000000-0000-0000-0000-000000000000', 163, '5he44ei2ckvz', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-10 18:25:59.096794+00', '2026-04-12 18:21:43.970252+00', 'g7z344bjmn2g', 'e97c65c5-623f-4fbe-a2d6-26c99b91e481'),
	('00000000-0000-0000-0000-000000000000', 165, 'anz2rwmcvase', 'a7dac9e2-27eb-452a-b22b-a3ec5a1c2337', false, '2026-04-12 20:19:50.796186+00', '2026-04-12 20:19:50.796186+00', NULL, 'd3bcf711-26c3-4503-9998-0b21e8e8e1d1'),
	('00000000-0000-0000-0000-000000000000', 167, 'vrvkfcrzrvq4', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-14 15:37:08.650568+00', '2026-04-14 22:56:24.549924+00', 'wszsn2ovco4b', '6189aeee-4ebb-4080-afcf-74a4545785df'),
	('00000000-0000-0000-0000-000000000000', 48, '3eujdl6iql3w', 'a78aeb6e-4b28-4562-b33e-69bee9ff287d', true, '2026-02-21 23:40:58.825338+00', '2026-02-23 02:26:05.492449+00', 'teizxztltope', '5bc7f88e-69a6-4185-934e-c1bbbd6600aa'),
	('00000000-0000-0000-0000-000000000000', 54, 'hrbtatrw4bxk', 'a78aeb6e-4b28-4562-b33e-69bee9ff287d', false, '2026-02-23 02:26:05.524577+00', '2026-02-23 02:26:05.524577+00', '3eujdl6iql3w', '5bc7f88e-69a6-4185-934e-c1bbbd6600aa'),
	('00000000-0000-0000-0000-000000000000', 143, 'jazamipq6cph', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-02 13:13:26.51215+00', '2026-04-02 14:41:32.762639+00', NULL, 'e97c65c5-623f-4fbe-a2d6-26c99b91e481'),
	('00000000-0000-0000-0000-000000000000', 169, 'hh3lkntnea4u', '08c75dfe-9643-4861-b48b-31da73ad46ec', false, '2026-04-18 21:28:29.465816+00', '2026-04-18 21:28:29.465816+00', 'px2ilf2csb5o', '401ce2e8-9d55-4fb8-adec-dfdd8725c5a3'),
	('00000000-0000-0000-0000-000000000000', 149, 'cxlegen25ecj', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-03 02:04:50.708249+00', '2026-04-05 19:02:45.038867+00', 'bdmayrjlpva7', 'e97c65c5-623f-4fbe-a2d6-26c99b91e481'),
	('00000000-0000-0000-0000-000000000000', 153, 'hauot2ql5r6o', '5bbe1655-25ba-46e2-9d85-5cc097d1a5a2', false, '2026-04-07 19:36:53.337708+00', '2026-04-07 19:36:53.337708+00', NULL, '33cfbd6c-cc7e-44cf-8900-f859a8aa3d12'),
	('00000000-0000-0000-0000-000000000000', 151, '6nm775g4o6wz', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-07 13:26:48.926362+00', '2026-04-07 23:12:27.516291+00', 'ae4r5polrzvj', 'e97c65c5-623f-4fbe-a2d6-26c99b91e481'),
	('00000000-0000-0000-0000-000000000000', 156, 'apbwmtutnvk6', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-07 21:50:01.033152+00', '2026-04-07 23:54:40.270902+00', '6dfatejd7lwj', '6189aeee-4ebb-4080-afcf-74a4545785df'),
	('00000000-0000-0000-0000-000000000000', 160, 'yiqnnzywuy4l', '85920cf2-206d-4d85-bebe-2b10ad1e663f', false, '2026-04-08 05:09:46.504864+00', '2026-04-08 05:09:46.504864+00', NULL, '513d772c-425b-460f-9906-8506c518190c'),
	('00000000-0000-0000-0000-000000000000', 158, 'ph4lvbatoh6q', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-07 23:54:40.291663+00', '2026-04-08 15:31:55.741919+00', 'apbwmtutnvk6', '6189aeee-4ebb-4080-afcf-74a4545785df'),
	('00000000-0000-0000-0000-000000000000', 164, 'ypkpn6rb5ozw', '71306ed0-8484-46de-8a00-d81cf58a5847', false, '2026-04-12 18:21:44.00466+00', '2026-04-12 18:21:44.00466+00', '5he44ei2ckvz', 'e97c65c5-623f-4fbe-a2d6-26c99b91e481'),
	('00000000-0000-0000-0000-000000000000', 166, 'wdjnn3gitcli', 'a7dac9e2-27eb-452a-b22b-a3ec5a1c2337', false, '2026-04-12 20:22:15.255472+00', '2026-04-12 20:22:15.255472+00', NULL, '2d94e1e8-53a2-467c-a901-793491b5d4c4'),
	('00000000-0000-0000-0000-000000000000', 162, 'wszsn2ovco4b', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-08 15:31:55.769482+00', '2026-04-14 15:37:08.61879+00', 'ph4lvbatoh6q', '6189aeee-4ebb-4080-afcf-74a4545785df'),
	('00000000-0000-0000-0000-000000000000', 168, '4i4lzbdibzgg', '71306ed0-8484-46de-8a00-d81cf58a5847', false, '2026-04-14 22:56:24.570141+00', '2026-04-14 22:56:24.570141+00', 'vrvkfcrzrvq4', '6189aeee-4ebb-4080-afcf-74a4545785df'),
	('00000000-0000-0000-0000-000000000000', 144, 'jrzhibsf623l', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-02 13:19:48.954837+00', '2026-04-02 14:53:23.198235+00', NULL, '6189aeee-4ebb-4080-afcf-74a4545785df'),
	('00000000-0000-0000-0000-000000000000', 136, 'px2ilf2csb5o', '08c75dfe-9643-4861-b48b-31da73ad46ec', true, '2026-03-31 18:46:38.29567+00', '2026-04-18 21:28:29.437802+00', NULL, '401ce2e8-9d55-4fb8-adec-dfdd8725c5a3'),
	('00000000-0000-0000-0000-000000000000', 146, 'wczbafa6sc7p', '71306ed0-8484-46de-8a00-d81cf58a5847', true, '2026-04-02 14:53:23.20078+00', '2026-04-02 22:23:54.966934+00', 'jrzhibsf623l', '6189aeee-4ebb-4080-afcf-74a4545785df'),
	('00000000-0000-0000-0000-000000000000', 170, 'orn3jaqiwdyt', '08c75dfe-9643-4861-b48b-31da73ad46ec', false, '2026-04-19 14:05:14.804834+00', '2026-04-19 14:05:14.804834+00', NULL, '20de354d-787c-4dfc-b574-0a5879140ed4');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "full_name", "role", "phone", "updated_at", "created_at", "is_university") VALUES
	('4d52ee9e-b631-44b8-815f-681b6a56eec3', 'pruebausuario', 'user', NULL, '2026-02-16 23:32:34.018218+00', '2026-02-16 23:32:34.018218+00', false),
	('e563fb25-f0e3-4bab-ad2f-17b0d7090c60', 'Lucas Benitez', 'user', NULL, '2026-02-21 20:52:31.932085+00', '2026-02-21 20:52:31.932085+00', false),
	('973d642b-c4ce-4bc1-b9b6-41cb159d699c', 'ANABELLA MIGNINO ', 'user', NULL, '2026-02-21 22:38:50.299769+00', '2026-02-21 22:38:50.299769+00', false),
	('a78aeb6e-4b28-4562-b33e-69bee9ff287d', 'Melisa Martinez ', 'user', NULL, '2026-02-21 22:38:47.321831+00', '2026-02-21 22:38:47.321831+00', false),
	('c5d6b1ec-3e15-4d87-b11b-52f9d5d3454a', 'sdfsdf', 'user', NULL, '2026-03-24 19:07:09.559991+00', '2026-03-24 19:07:09.559991+00', true),
	('71306ed0-8484-46de-8a00-d81cf58a5847', 'Mauricio Fassina', 'admin', NULL, '2026-02-21 20:47:36.337343+00', '2026-02-21 20:47:36.337343+00', true),
	('5bbe1655-25ba-46e2-9d85-5cc097d1a5a2', 'Julian Bonini', 'user', NULL, '2026-04-07 19:36:53.205866+00', '2026-04-07 19:36:53.205866+00', true),
	('85920cf2-206d-4d85-bebe-2b10ad1e663f', 'Fer Piva', 'user', NULL, '2026-04-08 05:09:46.373969+00', '2026-04-08 05:09:46.373969+00', true),
	('a7dac9e2-27eb-452a-b22b-a3ec5a1c2337', 'Antonella Fassina', 'user', NULL, '2026-04-12 20:19:50.688438+00', '2026-04-12 20:19:50.688438+00', true),
	('08c75dfe-9643-4861-b48b-31da73ad46ec', 'dario', 'admin', NULL, '2026-02-16 18:29:48.689178+00', '2026-02-16 18:29:48.689178+00', true);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: catalogo_condiciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."catalogo_condiciones" ("id", "condicion", "descripcion", "created_at") VALUES
	(1, 'COVID-19', 'Ha tenido o transita el nuevo coronavirus COVID-19', '2026-02-16 18:03:07.654897+00'),
	(2, 'Síntomas de COVID-19', 'Presenta alguno de los síntomas del COVID-19', '2026-02-16 18:03:07.654897+00'),
	(3, 'Dificultad visual', 'Problemas de la vista o uso de lentes', '2026-02-16 18:03:07.654897+00'),
	(4, 'Problemas auditivos', 'Dificultades para oír', '2026-02-16 18:03:07.654897+00'),
	(5, 'Alergias', 'Alergias alimentarias, ambientales o medicamentosas', '2026-02-16 18:03:07.654897+00'),
	(6, 'Afecciones del corazón', 'Problemas cardíacos diagnosticados', '2026-02-16 18:03:07.654897+00'),
	(7, 'Epilepsia', 'Antecedentes de epilepsia o convulsiones', '2026-02-16 18:03:07.654897+00'),
	(8, 'Asma', 'Antecedentes o diagnóstico de asma', '2026-02-16 18:03:07.654897+00'),
	(9, 'Diabetes', 'Diagnóstico de diabetes', '2026-02-16 18:03:07.654897+00'),
	(10, 'Hipertensión', 'Presión arterial elevada o controlada con medicación', '2026-02-16 18:03:07.654897+00'),
	(11, 'Problemas respiratorios', 'Condiciones que afecten la respiración', '2026-02-16 18:03:07.654897+00'),
	(12, 'Convulsiones', 'Antecedentes de convulsiones', '2026-02-16 18:03:07.654897+00'),
	(13, 'Enfermedades de la sangre', 'Anemia, leucemia u otros trastornos sanguíneos', '2026-02-16 18:03:07.654897+00'),
	(14, 'Hepatitis u otras enfermedades del hígado', 'Hepatitis A, B, C u otros', '2026-02-16 18:03:07.654897+00'),
	(15, 'Limitaciones en actividad diaria', 'Restricciones físicas o funcionales', '2026-02-16 18:03:07.654897+00'),
	(16, 'Celiaquía', 'Intolerancia al gluten o enfermedad celíaca', '2026-02-16 18:03:07.654897+00'),
	(17, 'Luxaciones', 'Antecedentes de luxaciones articulares', '2026-02-16 18:03:07.654897+00'),
	(18, 'Problemas de la columna', 'Dolores o lesiones vertebrales', '2026-02-16 18:03:07.654897+00'),
	(19, 'Lesiones de cintura, rodillas o tobillos', 'Lesiones o dolencias en esas zonas', '2026-02-16 18:03:07.654897+00'),
	(20, 'Lesiones de hombros o brazos', 'Lesiones o dolencias en hombros o brazos', '2026-02-16 18:03:07.654897+00'),
	(21, 'Bajo cuidado médico', 'Se encuentra bajo control médico activo', '2026-02-16 18:03:07.654897+00'),
	(22, 'Toma medicación actualmente', 'Uso actual de medicamentos', '2026-02-16 18:03:07.654897+00'),
	(23, 'Embarazo', 'Embarazo actual o reciente', '2026-02-16 18:03:07.654897+00'),
	(24, 'Otra condición que pueda perjudicar la salud', 'Cualquier otra condición relevante', '2026-02-16 18:03:07.654897+00');


--
-- Data for Name: condiciones_medicas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."condiciones_medicas" ("id", "condicion", "descripcion", "created_at") VALUES
	(1, 'Asma', 'Dificultad respiratoria crónica', '2026-02-02 21:05:26.374426+00'),
	(2, 'Diabetes', 'Niveles altos de glucosa en sangre', '2026-02-02 21:05:26.374426+00'),
	(3, 'Hipertensión', 'Presión arterial alta', '2026-02-02 21:05:26.374426+00'),
	(4, 'Celiaquía', 'Intolerancia al gluten', '2026-02-02 21:05:26.374426+00'),
	(5, 'Epilepsia', 'Trastorno del sistema nervioso', '2026-02-02 21:05:26.374426+00'),
	(6, 'Alergia Grave', 'Reacción anafiláctica', '2026-02-02 21:05:26.374426+00');


--
-- Data for Name: fichas_medicas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."fichas_medicas" ("id", "user_id", "obra_social", "contacto_emergencia_1", "telefono_emergencia_1", "contacto_emergencia_2", "telefono_emergencia_2", "tension_arterial", "estatura", "peso", "estado_salud", "ejercicio", "observaciones", "condiciones", "version", "updated_at", "grupo_sanguineo", "alergias", "medicamentos") VALUES
	('e28267d3-23a3-4ae9-91c3-f6fdc6d5d251', '71306ed0-8484-46de-8a00-d81cf58a5847', 'APROSS', 'Anabella Mignino', 3541574650, '', NULL, '', NULL, NULL, NULL, NULL, '', '[5, 22]', 1, '2026-04-02 03:43:19.379+00', 'O+', 'Aspirina, ibuprofeno y dipirona', '[{"name": "Allopurinol 300", "dosage": "1/2 x dia"}, {"name": "Gadolip 150", "dosage": "1 x dia"}]'),
	('65bb7773-fa88-42ec-85f0-95de72726b75', '5bbe1655-25ba-46e2-9d85-5cc097d1a5a2', 'Jerárquicos salud', 'Mariano bonini', 5493537554643, 'Stella tossolini', 5493537582436, '', '176', 68, NULL, NULL, 'A la noche tengo sed 🍻', '[]', 1, '2026-04-07 19:48:35.452+00', 'A+', 'Ninguna', '[]'),
	('a1e23c5b-3652-487d-92d4-ce4a94488acd', '08c75dfe-9643-4861-b48b-31da73ad46ec', 'sdfsdf', 'sdf', 32, 'sdf', 324, '', '567', 67, NULL, NULL, 'xcvxcv', '[1, 2, 3, 8]', 1, '2026-04-18 21:33:49.603+00', 'A-', 'asd', '[{"name": "asd", "dosage": "234"}]');


--
-- Data for Name: fichas_medicas_historial; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: viajes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."viajes" ("id", "titulo", "descripcion", "cupos_totales", "cupos_disponibles", "fecha_inicio", "fecha_fin", "estado", "created_at", "dificultad", "ubicacion", "imagen_url", "min_participantes") VALUES
	('8131d427-094c-4860-b131-60bad004d4fd', 'sdfg', 'sdf', 15, 15, '2026-03-24 18:50:00+00', '2026-03-26 18:50:00+00', 'finished', '2026-03-24 21:50:20.996644+00', 'Moderate', 'sdf', 'https://bwjwyfxiafklelgmvzcn.supabase.co/storage/v1/object/public/trip-images/trips/5v2hu436xe6_1774389003929.png', 8),
	('ae181b33-c932-46c7-932c-eae5c1a6da61', 'Cascada Los Chorrillos', '', 20, 20, '2026-04-18 17:32:00+00', '2026-04-18 17:32:00+00', 'published', '2026-03-31 20:32:26.005935+00', 'Moderate', 'Flor Serrana', 'https://bwjwyfxiafklelgmvzcn.supabase.co/storage/v1/object/public/trip-images/trips/ocom7ojur8_1774989130516.jpg', 10);


--
-- Data for Name: inscripciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."inscripciones" ("id", "viaje_id", "user_id", "estado", "created_at", "domicilio", "localidad", "provincia", "pais", "menu", "pdf", "soap_creada") VALUES
	('c1cbd4b8-e49c-42da-907a-19d205fc3b60', 'ae181b33-c932-46c7-932c-eae5c1a6da61', '71306ed0-8484-46de-8a00-d81cf58a5847', 'confirmed', '2026-04-02 03:43:19.646+00', 'Rio Grande 270', 'SAN ANTONIO DE ARREDONDO', 'Córdoba', 'Argentina', 'General', NULL, false),
	('3b0264ea-bd94-47c3-a79d-ae5906e8f011', 'ae181b33-c932-46c7-932c-eae5c1a6da61', '5bbe1655-25ba-46e2-9d85-5cc097d1a5a2', 'pending', '2026-04-07 19:48:35.757+00', 'Int. Villarroel 995', 'Bell ville', 'Córdoba', 'Argentina', 'General', NULL, false),
	('a65ac637-eca0-4483-ac93-c557c81986b9', 'ae181b33-c932-46c7-932c-eae5c1a6da61', '08c75dfe-9643-4861-b48b-31da73ad46ec', 'confirmed', '2026-04-18 21:33:49.924+00', 'Vzvz', 'Hzhz', 'Córdoba', 'Argentina', 'General', NULL, false);


--
-- Data for Name: fichas_soap; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: maestro_problemas_soap; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: novedades_universitarias; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."novedades_universitarias" ("id", "created_at", "titulo", "subtitulo", "contenido", "categoria", "imagen_url", "autor", "fecha_publicacion") VALUES
	('562ace01-da7a-4c26-9a2e-4de89b52f104', '2026-02-21 23:50:09.2263+00', 'dfgdfg', 'dfgdfg', 'dfgdfgdfg', 'Infraestructura', NULL, 'TrekManager Admin', '2026-02-21'),
	('54d157ab-1ece-4ff8-a7c1-0a15a6d02163', '2026-03-24 19:03:44.867215+00', 'dfgdfgdfg', 'dfgdfg', 'dfgdfgdfgdfgdfg', 'Estudiantes', NULL, 'TrekManager Admin', '2026-03-24');


--
-- Data for Name: reportes_soap; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: reportes_soap_problemas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: simulacros_soap; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."simulacros_soap" ("id", "user_id", "paciente_nombre", "data", "created_at", "updated_at") VALUES
	('a0fe7e00-f8c0-4218-984e-47a876e151cb', '71306ed0-8484-46de-8a00-d81cf58a5847', 'Masculino', '{"id": "a0fe7e00-f8c0-4218-984e-47a876e151cb", "escena": "Masculino. 53 años. Previo actividad expuesta a altura (canopy). zona agreste 1 hora ambulancia, con comunicación. Se toma el pecho y altera repentinamente. 10:32 hs. GS A+. Sedentario. Fumador (15 cigarrillos x día).", "estado": "finalizado", "sv_piel": "", "severity": "mod", "e_eventos": "-", "e_sintoma": "Dolor de pecho", "e_alergias": "No tiene", "e_medicacion": "Sí toma, control hipertensión", "observacione": "", "e_historia_pa": "Hipertensión. AFEC", "e_ultima_inge": "1 cadé 2 medialunas. desayuno.", "examen_fisico": "No siente dolor al tacto.", "hora_incidente": "20:34", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "(A)", "hora": "10:32", "piel": "pálida, fría y Húmeda", "spo2": "", "pulso": "105 (i)", "presion": "-", "respiracion": "28 (T)", "temperatura": "36.5"}, {"avdi": "", "hora": "11:56", "piel": "", "spo2": "", "pulso": "No tiene", "presion": "", "respiracion": "No tiene", "temperatura": ""}], "evaluacion_guia": "", "referencia_viaje": "", "notas_adicionales": "Abreviaturas:\nGS  (Grupo sanguíneo)\nAFEC: antecedente familiar enfermedad coronaria\n(i) irregular\nT Trabajosa\nA Alerta.", "problemas_seleccionados": [{"orden": 1, "problema": "Problema cardíaco.", "tratamiento": "Evacuación", "problema_anticipado": "PCR", "observacion_especifica": ""}, {"orden": 2, "problema": "PCR", "tratamiento": "RCP", "problema_anticipado": "Muerte", "observacion_especifica": ""}]}', '2026-03-24 23:51:30.55+00', '2026-03-24 23:53:54.272963+00'),
	('7c5ab6e2-dc43-4899-9989-1ea4b206cc49', '71306ed0-8484-46de-8a00-d81cf58a5847', 'Nn', '{"id": "7c5ab6e2-dc43-4899-9989-1ea4b206cc49", "escena": "Víctima en pie de vía cerro la cruz casco roto, sangre en la cabeza y pierna, sospecha caída de altura.", "estado": "borrador", "sv_piel": "", "severity": "mod", "e_eventos": "No recuerda", "e_sintoma": "Dolor en cabeza", "e_alergias": "No tiene", "e_medicacion": "No toma", "observacione": "", "e_historia_pa": "Nada", "e_ultima_inge": "Desayuno completo, hidrataron normal", "examen_fisico": "Sangre en la cabeza. Golpes varios. Sospecha trauma de columna y de craneo", "hora_incidente": "06:06 p.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "Alerta cooperativo", "hora": "12:00", "piel": "X", "spo2": "X", "pulso": "90", "presion": "X", "respiracion": "16", "temperatura": "X"}], "evaluacion_guia": "", "referencia_viaje": "", "notas_adicionales": "Nanana", "problemas_seleccionados": [{"orden": "01", "problema": "Posible trauma de cráneo y de columna", "tratamiento": "Protocolo de descarte de lesión de columna\nEvacuacion", "problema_anticipado": "Shock", "observacion_especifica": ""}, {"orden": 2, "problema": "", "tratamiento": "", "problema_anticipado": "", "observacion_especifica": ""}]}', '2026-03-24 21:16:03.273+00', '2026-03-24 23:34:04.136144+00'),
	('9d0236cd-53e4-4bfd-a22a-d31ce58df0c2', '08c75dfe-9643-4861-b48b-31da73ad46ec', 'Daro2', '{"id": "9d0236cd-53e4-4bfd-a22a-d31ce58df0c2", "escena": "", "estado": "borrador", "sv_piel": "", "severity": "mod", "e_eventos": "", "e_sintoma": "", "e_alergias": "", "e_medicacion": "", "observacione": "", "e_historia_pa": "", "e_ultima_inge": "", "examen_fisico": "", "hora_incidente": "03:53 p.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "A (Alerta)", "hora": "03:53 p.m.", "piel": "", "spo2": "", "pulso": "", "presion": "", "respiracion": "", "temperatura": ""}], "evaluacion_guia": "", "referencia_viaje": ""}', '2026-03-31 18:53:30.37+00', '2026-03-31 18:53:30.382401+00'),
	('0dd84478-e564-40e5-ab65-82a69c8fe013', '08c75dfe-9643-4861-b48b-31da73ad46ec', 'Hshs', '{"escena": "Bzbzbd", "estado": "finalizado", "sv_piel": "", "severity": "mod", "e_eventos": "", "e_sintoma": "Bzbd", "e_alergias": "Hdhd", "e_medicacion": "Vzbd", "observacione": "", "e_historia_pa": "Hzhd", "e_ultima_inge": "Bxbd", "examen_fisico": "", "hora_incidente": "12:32 p.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "A (Alerta)", "hora": "12:32 p.m.", "piel": "", "spo2": "Bzbdbd", "pulso": "Vzbdbsvzvzbvzbdbdbdbdbd", "presion": "", "respiracion": "Bdbd", "temperatura": ""}], "evaluacion_guia": "", "referencia_viaje": ""}', '2026-03-31 15:32:47.528+00', '2026-03-31 15:32:47.602361+00'),
	('7efebfa5-3f56-4dbc-b441-ade2179c7940', '71306ed0-8484-46de-8a00-d81cf58a5847', 'sdf', '{"id": "7efebfa5-3f56-4dbc-b441-ade2179c7940", "escena": "sdfsdfsdfsdfsdfsdf", "estado": "borrador", "sv_piel": "", "severity": "mod", "e_eventos": "", "e_sintoma": "sdfsdf\nsdf\nsd\nf\nsdf\nsdf", "e_alergias": "", "e_medicacion": "", "observacione": "", "e_historia_pa": "", "e_ultima_inge": "", "examen_fisico": "", "hora_incidente": "03:49 p.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "A (Alerta)", "hora": "03:49 p.m.", "piel": "", "spo2": "", "pulso": "", "presion": "", "respiracion": "", "temperatura": ""}], "evaluacion_guia": "", "referencia_viaje": ""}', '2026-03-31 18:50:02.554+00', '2026-03-31 18:54:03.396503+00'),
	('0662759e-aac8-45db-b2f8-82234bec81a4', '08c75dfe-9643-4861-b48b-31da73ad46ec', 'Daro prueba', '{"id": "0662759e-aac8-45db-b2f8-82234bec81a4", "escena": "Bxbxbxb", "estado": "finalizado", "sv_piel": "", "severity": "mod", "e_eventos": "", "e_sintoma": "Bdbdbdb", "e_alergias": "Vdbdbdb", "e_medicacion": "", "observacione": "", "e_historia_pa": "", "e_ultima_inge": "", "examen_fisico": "Vzbzbxbx", "hora_incidente": "03:10 p.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "A (Alerta)", "hora": "03:10 p.m.", "piel": "Bdbdb", "spo2": "Bxbdb", "pulso": "6363", "presion": "", "respiracion": "Vdbd", "temperatura": ""}], "evaluacion_guia": "", "referencia_viaje": "", "notas_adicionales": "Vdbdbd", "problemas_seleccionados": [{"orden": 1, "problema": "Bxbdbd", "tratamiento": "Vdbdbd", "problema_anticipado": "Hdbdbdbd", "observacion_especifica": ""}]}', '2026-03-31 18:11:26.987+00', '2026-03-31 18:11:51.925823+00'),
	('3c727b26-36bc-4ce3-af4a-91f1d0667c87', '71306ed0-8484-46de-8a00-d81cf58a5847', 'Marcelo', '{"id": "3c727b26-36bc-4ce3-af4a-91f1d0667c87", "escena": "Cayo todo Arredondo mas", "estado": "finalizado", "sv_piel": "", "severity": "mod", "e_eventos": "", "e_sintoma": "Dolores", "e_alergias": "", "e_medicacion": "", "observacione": "", "e_historia_pa": "", "e_ultima_inge": "", "examen_fisico": "", "hora_incidente": "03:11 p.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "A (Alerta)", "hora": "03:11 p.m.", "piel": "", "spo2": "", "pulso": "", "presion": "", "respiracion": "", "temperatura": ""}, {"avdi": "", "hora": "03:12 p.m.", "piel": "", "spo2": "", "pulso": "", "presion": "", "respiracion": "", "temperatura": ""}], "evaluacion_guia": "", "referencia_viaje": ""}', '2026-03-31 18:15:07.280225+00', '2026-03-31 19:04:46.377981+00'),
	('3dcc8154-7a07-4f7a-b55b-da8c0ed02082', '08c75dfe-9643-4861-b48b-31da73ad46ec', 'Vdbdb', '{"id": "3dcc8154-7a07-4f7a-b55b-da8c0ed02082", "escena": "Bzbzbdb", "estado": "finalizado", "sv_piel": "", "severity": "mod", "e_eventos": "", "e_sintoma": "", "e_alergias": "", "e_medicacion": "", "observacione": "", "e_historia_pa": "", "e_ultima_inge": "", "examen_fisico": "", "hora_incidente": "03:52 p.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "A (Alerta)", "hora": "03:52 p.m.", "piel": "", "spo2": "", "pulso": "", "presion": "", "respiracion": "", "temperatura": ""}], "evaluacion_guia": "", "referencia_viaje": ""}', '2026-03-31 18:52:24.343+00', '2026-03-31 18:52:24.377425+00'),
	('b98514eb-8141-4710-9b3d-925788a3517a', '08c75dfe-9643-4861-b48b-31da73ad46ec', 'Bdbdbd', '{"id": "b98514eb-8141-4710-9b3d-925788a3517a", "escena": "", "estado": "borrador", "sv_piel": "", "severity": "mod", "e_eventos": "", "e_sintoma": "", "e_alergias": "", "e_medicacion": "", "observacione": "", "e_historia_pa": "", "e_ultima_inge": "", "examen_fisico": "", "hora_incidente": "03:52 p.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "A (Alerta)", "hora": "03:52 p.m.", "piel": "", "spo2": "", "pulso": "", "presion": "", "respiracion": "", "temperatura": ""}], "evaluacion_guia": "", "referencia_viaje": ""}', '2026-03-31 18:52:36.333+00', '2026-03-31 18:52:36.339281+00'),
	('c30ee07e-a3b0-41fd-9ac0-9de0c675bbc1', '08c75dfe-9643-4861-b48b-31da73ad46ec', 'Hfhfhdh', '{"id": "c30ee07e-a3b0-41fd-9ac0-9de0c675bbc1", "escena": "Bdbdbdbd", "estado": "borrador", "sv_piel": "", "severity": "mod", "e_eventos": "", "e_sintoma": "", "e_alergias": "", "e_medicacion": "", "observacione": "", "e_historia_pa": "", "e_ultima_inge": "", "examen_fisico": "", "hora_incidente": "03:52 p.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "A (Alerta)", "hora": "03:52 p.m.", "piel": "", "spo2": "", "pulso": "", "presion": "", "respiracion": "", "temperatura": ""}], "evaluacion_guia": "", "referencia_viaje": ""}', '2026-03-31 18:53:06.253+00', '2026-03-31 18:53:06.267085+00'),
	('6a122bd0-97ba-496d-866b-fc64f529577e', '08c75dfe-9643-4861-b48b-31da73ad46ec', 'Daro3', '{"id": "6a122bd0-97ba-496d-866b-fc64f529577e", "escena": "Bzbdbdbdbjd", "estado": "finalizado", "sv_piel": "", "severity": "mod", "e_eventos": "", "e_sintoma": "Hdhdhx\nX\nF\nF\n\nX\nX", "e_alergias": "", "e_medicacion": "", "observacione": "", "e_historia_pa": "", "e_ultima_inge": "", "examen_fisico": "", "hora_incidente": "03:54 p.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "A (Alerta)", "hora": "03:54 p.m.", "piel": "", "spo2": "", "pulso": "", "presion": "", "respiracion": "", "temperatura": ""}], "evaluacion_guia": "", "referencia_viaje": "", "notas_adicionales": "Bdbdbdbd", "problemas_seleccionados": [{"orden": 1, "problema": "Bzbzbxd\nD\nD\nD\nD\nD\nD", "tratamiento": "Dhff\nF\nF\nF\nF\n", "problema_anticipado": "D\nD\nD\nD\nD\n\nD", "observacion_especifica": ""}]}', '2026-03-31 18:56:39.707477+00', '2026-03-31 18:56:39.707116+00'),
	('e4033f36-8460-4787-a49c-05494071edd8', '71306ed0-8484-46de-8a00-d81cf58a5847', 'Ramiro z', '{"id": "e4033f36-8460-4787-a49c-05494071edd8", "escena": "Descendiendo por cuesta del perro ramiro 40 años se le traba el pie con piedras, hace palanca y tiene lesión en la rodilla izquierda 16 horas ", "estado": "finalizado", "sv_piel": "", "severity": "mod", "e_eventos": "Si recuerda", "e_sintoma": "Dolor en rodilla.", "e_alergias": "Si. Hormigas, avispas, arañas y alacranes", "e_medicacion": "No toma", "observacione": "", "e_historia_pa": "Nada", "e_ultima_inge": "Sandwich de pollo. Hidrataron normal agua, café en el desayuno completo", "examen_fisico": "Leve hinchazón en la rodilla izquierda, sin crepitacion. Soporta peso del cuerpo. Herida superficial", "hora_incidente": "02:23 p.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "A (Alerta cooperativo)", "hora": "14:23", "piel": "Normal", "spo2": "", "pulso": "75", "presion": "60 pulso radial", "respiracion": "18", "temperatura": ""}, {"avdi": "Alerta cooperativo", "hora": "14:46", "piel": "Normal", "spo2": "", "pulso": "78", "presion": "", "respiracion": "18", "temperatura": ""}], "evaluacion_guia": "", "referencia_viaje": "", "notas_adicionales": "Rescatista mf", "problemas_seleccionados": [{"orden": 1, "problema": "Lesión estable de rodilla", "tratamiento": "RICE?\nEvacuación pasiva", "problema_anticipado": "Disminución msc distal", "observacion_especifica": ""}, {"orden": 2, "problema": "Herida abierta superficial rodilla", "tratamiento": "Lavar limpiar y cubrir", "problema_anticipado": "Infección ", "observacion_especifica": ""}]}', '2026-03-26 17:23:25.76+00', '2026-04-05 19:13:03.464971+00'),
	('519f4381-d31e-45cb-9785-023a8c9bc39c', '71306ed0-8484-46de-8a00-d81cf58a5847', 'Alejandro', '{"id": "519f4381-d31e-45cb-9785-023a8c9bc39c", "escena": "Jejdbsjsbf", "estado": "finalizado", "sv_piel": "", "severity": "mod", "e_eventos": "", "e_sintoma": "Jdjdjd", "e_alergias": "Nfnjd", "e_medicacion": "Ndndj", "observacione": "", "e_historia_pa": "", "e_ultima_inge": "", "examen_fisico": "Nfjdjek", "hora_incidente": "10:29 a.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "A (Alerta)", "hora": "10:29 a.m.", "piel": "Bdjdjdjdjdnfnnfnfnfnfbfbfbfbf", "spo2": "747484848", "pulso": "859", "presion": "648", "respiracion": "748", "temperatura": "747474\n\n\n\n"}, {"avdi": "", "hora": "10:30 a.m.", "piel": "", "spo2": "", "pulso": "567", "presion": "56", "respiracion": "55", "temperatura": ""}], "evaluacion_guia": "", "referencia_viaje": "", "notas_adicionales": "Bdjd", "problemas_seleccionados": [{"orden": "1", "problema": "Concusion ", "tratamiento": "Evacuar", "problema_anticipado": "Aumento pic", "observacion_especifica": ""}, {"orden": 2, "problema": "Lesión estable", "tratamiento": "Evacuación pasiva", "problema_anticipado": "Disminución msc distal", "observacion_especifica": ""}]}', '2026-04-07 13:32:26.809+00', '2026-04-07 13:32:28.91349+00'),
	('eff17b79-7194-405c-81c8-5c7ac0dbaf21', '5bbe1655-25ba-46e2-9d85-5cc097d1a5a2', 'Mauricio', '{"id": "eff17b79-7194-405c-81c8-5c7ac0dbaf21", "escena": "Se caio", "estado": "finalizado", "sv_piel": "", "severity": "mod", "e_eventos": "Previa a la motnaña", "e_sintoma": "Siempre se queja", "e_alergias": "Al laburo", "e_medicacion": "Faso", "observacione": "", "e_historia_pa": "No puedo escribir todas las historias de este señor", "e_ultima_inge": "Milanesas antes de salir y una salta negra", "examen_fisico": "", "hora_incidente": "04:41 p.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "A (Alerta)", "hora": "04:41 p.m.", "piel": "Es blanquito", "spo2": "78", "pulso": "178", "presion": "Por las nubes", "respiracion": "En subida fuerte", "temperatura": "Se nos va"}], "evaluacion_guia": "", "referencia_viaje": ""}', '2026-04-07 19:45:50.285+00', '2026-04-07 19:45:51.313588+00'),
	('0c3d1269-a68c-4974-91ee-4ca3e2877330', '71306ed0-8484-46de-8a00-d81cf58a5847', 'Gabriel', '{"id": "0c3d1269-a68c-4974-91ee-4ca3e2877330", "escena": "Chalten. Trekking 3 días a 8 km de camino mas cercano. Grupo de 6 personas (guia Pablo). Gabriel es picado 2 veces en tobillo derecho por ¿abejas?", "estado": "finalizado", "sv_piel": "", "severity": "mod", "e_eventos": "Si recuerda", "e_sintoma": "Dolor en tobillo derecho", "e_alergias": "Al polen y polvo.", "e_medicacion": "", "observacione": "", "e_historia_pa": "Inflamaciones locales severas por picaduras de abejas. Nunca reacciones sistemicas.", "e_ultima_inge": "Almuerzo empanadas", "examen_fisico": "14:20 irritación y ronchas en estómago, laterales y espalda", "hora_incidente": "10:43 a.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "A +", "hora": "14:22", "piel": "Rosada, tibia y seca", "spo2": "", "pulso": "104 (regular)", "presion": "80 (palpada)", "respiracion": "22", "temperatura": ""}, {"avdi": "A+", "hora": "14,28", "piel": "Pálida fría y húmeda ", "spo2": "", "pulso": "130 regular", "presion": "80 palpada", "respiracion": "24", "temperatura": "36.5 "}], "evaluacion_guia": "", "referencia_viaje": "", "problemas_seleccionados": [{"orden": 1, "problema": "14:22 reacción alérgica ", "tratamiento": "Administrar antihistaminico. Abrigar. Hidratar. Lavar herida. Evacuar.", "problema_anticipado": "Stock anafilactico", "observacion_especifica": ""}, {"orden": 2, "problema": "14:28 reacción alérgica tratada.", "tratamiento": "Hidratar. Abrigar. Evacuación pasiva", "problema_anticipado": "Rebrote alérgico", "observacion_especifica": ""}]}', '2026-04-07 13:46:04.478+00', '2026-04-07 23:12:28.512987+00'),
	('fd16b929-6e39-49db-8a17-56cf568a8d9f', '71306ed0-8484-46de-8a00-d81cf58a5847', 'Lucas', '{"id": "fd16b929-6e39-49db-8a17-56cf568a8d9f", "escena": "Cyfhdgdf", "estado": "finalizado", "sv_piel": "", "severity": "mod", "e_eventos": "Cucuugf", "e_sintoma": "Kgzhx", "e_alergias": "Hxhxhhgfg", "e_medicacion": "Hcycyycjcu", "observacione": "", "e_historia_pa": "Hcjc", "e_ultima_inge": "Yfy", "examen_fisico": "Ugucuufcu", "hora_incidente": "08:19 p.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "A (Alerta)", "hora": "09.10p.m.", "piel": "", "spo2": "", "pulso": "Jcucjcj\n", "presion": "Gh", "respiracion": "Jcbh", "temperatura": ""}, {"avdi": "", "hora": "08:28 p.m.", "piel": "", "spo2": "", "pulso": "", "presion": "", "respiracion": "", "temperatura": ""}], "evaluacion_guia": "", "referencia_viaje": "", "problemas_seleccionados": [{"orden": 1, "problema": "Lesion", "tratamiento": "Evacuación ", "problema_anticipado": "Aumento pcu", "observacion_especifica": ""}, {"orden": "", "problema": "Hdbdjb", "tratamiento": "Bdjdjhdv", "problema_anticipado": "Bdbdjdj", "observacion_especifica": ""}]}', '2026-04-07 23:24:11.772+00', '2026-04-07 23:40:40.845141+00'),
	('551df577-abd0-45ae-8cc1-5f1e79ffe40f', '71306ed0-8484-46de-8a00-d81cf58a5847', 'Nn', '{"id": "551df577-abd0-45ae-8cc1-5f1e79ffe40f", "escena": "Ujgfhh", "estado": "borrador", "sv_piel": "", "severity": "mod", "e_eventos": "", "e_sintoma": "", "e_alergias": "", "e_medicacion": "", "observacione": "", "e_historia_pa": "", "e_ultima_inge": "", "examen_fisico": "", "hora_incidente": "08:49 p.m.", "responsable_id": "STUDENT-UNI", "signos_vitales": [{"avdi": "A (Alerta)", "hora": "08:49 p.m.", "piel": "", "spo2": "", "pulso": "", "presion": "", "respiracion": "", "temperatura": ""}, {"avdi": "", "hora": "08:51 p.m.", "piel": "", "spo2": "", "pulso": "", "presion": "", "respiracion": "", "temperatura": ""}], "evaluacion_guia": "", "referencia_viaje": "", "problemas_seleccionados": [{"orden": 1, "problema": "", "tratamiento": "", "problema_anticipado": "", "observacion_especifica": ""}]}', '2026-04-07 23:52:08.245+00', '2026-04-10 18:27:48.061146+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('trip-images', 'trip-images', NULL, '2026-02-16 19:32:06.344915+00', '2026-02-16 19:32:06.344915+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('91247f3c-a484-44e6-af3c-a440b072b270', 'trip-images', 'trips/77lp388yahn_1771270503939.png', '08c75dfe-9643-4861-b48b-31da73ad46ec', '2026-02-16 19:35:03.842996+00', '2026-02-16 19:35:03.842996+00', '2026-02-16 19:35:03.842996+00', '{"eTag": "\"3f6fd512893bc480f97d87ce6a4e9e9c\"", "size": 5516, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-16T19:35:04.000Z", "contentLength": 5516, "httpStatusCode": 200}', 'a609af6b-baa9-4861-b69d-79f6f7e155b3', '08c75dfe-9643-4861-b48b-31da73ad46ec', '{}'),
	('76714ec3-9016-4acb-b888-53185258b9bc', 'trip-images', 'trips/x8eyal8ij1h_1771270540350.png', '08c75dfe-9643-4861-b48b-31da73ad46ec', '2026-02-16 19:35:41.748723+00', '2026-02-16 19:35:41.748723+00', '2026-02-16 19:35:41.748723+00', '{"eTag": "\"fcf5aad6dd1e180d57085080b2e077d4\"", "size": 1406003, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-16T19:35:42.000Z", "contentLength": 1406003, "httpStatusCode": 200}', 'fb5523a8-8a57-42ab-9c3d-d750f7ae1a9e', '08c75dfe-9643-4861-b48b-31da73ad46ec', '{}'),
	('163b0b6d-37f0-4bf8-a06f-1b3a025dcb09', 'trip-images', 'trips/rj5cwgtbjz_1771288603372.png', '08c75dfe-9643-4861-b48b-31da73ad46ec', '2026-02-17 00:36:43.618322+00', '2026-02-17 00:36:43.618322+00', '2026-02-17 00:36:43.618322+00', '{"eTag": "\"fddfdc9ebcbd6c12c8145993687ad69d\"", "size": 19569, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-17T00:36:44.000Z", "contentLength": 19569, "httpStatusCode": 200}', '391f2aae-6856-44e6-a047-68044f95247b', '08c75dfe-9643-4861-b48b-31da73ad46ec', '{}'),
	('70c28610-340f-48d1-8aa5-121abce57806', 'trip-images', 'trips/gcs4cro1v0d_1771294019546.png', '08c75dfe-9643-4861-b48b-31da73ad46ec', '2026-02-17 02:07:04.277981+00', '2026-02-17 02:07:04.277981+00', '2026-02-17 02:07:04.277981+00', '{"eTag": "\"7cc833d659c3953f34bb777d08ca81b4\"", "size": 402060, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-02-17T02:07:05.000Z", "contentLength": 402060, "httpStatusCode": 200}', 'a6e29c73-09e9-4f3d-a219-ae88c3b572cf', '08c75dfe-9643-4861-b48b-31da73ad46ec', '{}'),
	('bf4c245d-de68-41cd-bf4f-5bc29db5642a', 'trip-images', 'trips/zl88lroy93h_1771706097491.svg', '08c75dfe-9643-4861-b48b-31da73ad46ec', '2026-02-21 20:35:04.008284+00', '2026-02-21 20:35:04.008284+00', '2026-02-21 20:35:04.008284+00', '{"eTag": "\"9976bc2965282a084c3ddda0a314597b\"", "size": 7283, "mimetype": "image/svg+xml", "cacheControl": "max-age=3600", "lastModified": "2026-02-21T20:35:04.000Z", "contentLength": 7283, "httpStatusCode": 200}', '517d8d5e-f028-40a3-be91-7279abb93363', '08c75dfe-9643-4861-b48b-31da73ad46ec', '{}'),
	('2f888494-70af-4664-8834-d35c12d7eae0', 'trip-images', 'trips/ojhuf1n59r_1771714658533.jpg', '71306ed0-8484-46de-8a00-d81cf58a5847', '2026-02-21 22:57:40.432665+00', '2026-02-21 22:57:40.432665+00', '2026-02-21 22:57:40.432665+00', '{"eTag": "\"02c2337afb922e85547c781c6ac7c6a5\"", "size": 432912, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-21T22:57:41.000Z", "contentLength": 432912, "httpStatusCode": 200}', '224f7313-78ef-403a-94a4-7986c7bef5b6', '71306ed0-8484-46de-8a00-d81cf58a5847', '{}'),
	('7c312e8e-ebb8-4079-bb5e-e679f05eae5d', 'trip-images', 'trips/q4bvlb95ovd_1771714997208.jpg', '71306ed0-8484-46de-8a00-d81cf58a5847', '2026-02-21 23:03:19.085434+00', '2026-02-21 23:03:19.085434+00', '2026-02-21 23:03:19.085434+00', '{"eTag": "\"55787c7efcd369e7efdea3c07e461809\"", "size": 110573, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-21T23:03:20.000Z", "contentLength": 110573, "httpStatusCode": 200}', '93318221-24fb-40eb-b3ea-909c209419c7', '71306ed0-8484-46de-8a00-d81cf58a5847', '{}'),
	('cf419133-d2e0-4d10-9b36-71c58ab6d903', 'trip-images', 'trips/pr80c5e9wo_1771715291131.jpg', '71306ed0-8484-46de-8a00-d81cf58a5847', '2026-02-21 23:08:12.563601+00', '2026-02-21 23:08:12.563601+00', '2026-02-21 23:08:12.563601+00', '{"eTag": "\"55787c7efcd369e7efdea3c07e461809\"", "size": 110573, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-02-21T23:08:13.000Z", "contentLength": 110573, "httpStatusCode": 200}', '622871ae-bdfc-4737-a4c6-ecd4c8297509', '71306ed0-8484-46de-8a00-d81cf58a5847', '{}'),
	('acd4eba0-b11b-4061-8134-72f732db8ba3', 'trip-images', 'trips/5v2hu436xe6_1774389003929.png', '08c75dfe-9643-4861-b48b-31da73ad46ec', '2026-03-24 21:50:03.938875+00', '2026-03-24 21:50:03.938875+00', '2026-03-24 21:50:03.938875+00', '{"eTag": "\"5c4c25ad4e14243b0d0ff7d0645536c5\"", "size": 73680, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-03-24T21:50:04.000Z", "contentLength": 73680, "httpStatusCode": 200}', '7133143c-efcb-47ce-918d-7e6880037080', '08c75dfe-9643-4861-b48b-31da73ad46ec', '{}'),
	('b5b69022-6730-4c2e-9546-35382c0eedc8', 'trip-images', 'trips/lam6igpwwub_1774989089306.jpeg', '71306ed0-8484-46de-8a00-d81cf58a5847', '2026-03-31 20:30:45.469375+00', '2026-03-31 20:30:45.469375+00', '2026-03-31 20:30:45.469375+00', '{"eTag": "\"55787c7efcd369e7efdea3c07e461809\"", "size": 110573, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-03-31T20:30:46.000Z", "contentLength": 110573, "httpStatusCode": 200}', '2546b1db-c189-4c7f-bf8e-84b6ea5d8ea6', '71306ed0-8484-46de-8a00-d81cf58a5847', '{}'),
	('0920f72e-51dc-45e9-84a2-bf2c6d0d0b64', 'trip-images', 'trips/ocom7ojur8_1774989130516.jpg', '71306ed0-8484-46de-8a00-d81cf58a5847', '2026-03-31 20:31:28.799206+00', '2026-03-31 20:31:28.799206+00', '2026-03-31 20:31:28.799206+00', '{"eTag": "\"10db2aea957fc99b7c21e17cf880a0d0\"", "size": 4111907, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-03-31T20:31:29.000Z", "contentLength": 4111907, "httpStatusCode": 200}', '00ac2d44-010c-442b-8454-a8744ceb62a8', '71306ed0-8484-46de-8a00-d81cf58a5847', '{}');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 170, true);


--
-- Name: condiciones_medicas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."condiciones_medicas_id_seq"', 6, true);


--
-- Name: fichas_soap_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."fichas_soap_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict A5ewLsuHBA9UbbuLfuMnWuRkyWmUahgY2em6zeKEGsshKBg5MWb6dAMESn6taLt

RESET ALL;
