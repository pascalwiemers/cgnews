/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')
const { PrismaLibSQL } = require('@prisma/adapter-libsql')

function localSqliteUrl() {
	const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db'

	if (databaseUrl.startsWith('file:./') && !databaseUrl.startsWith('file:./prisma/')) {
		return `file:./prisma/${databaseUrl.slice('file:./'.length)}`
	}

	return databaseUrl
}

const adapter = new PrismaLibSQL({ url: localSqliteUrl() })
const prisma = new PrismaClient({ adapter })

async function main() {
	// Upsert a demo user
	const user = await prisma.user.upsert({
		where: { clerkId: 'seed_user_1' },
		update: {
			profile: {
				upsert: {
					update: {
						about: 'Lighting TD and CGNews seed curator.',
						website: 'https://example.com/alice',
						discipline: 'Lighting',
						affiliationStatus: 'Studio artist',
						location: 'Berlin, DE',
						timezone: 'Europe/Berlin',
						karma: 100,
					},
					create: {
						about: 'Lighting TD and CGNews seed curator.',
						website: 'https://example.com/alice',
						discipline: 'Lighting',
						affiliationStatus: 'Studio artist',
						location: 'Berlin, DE',
						timezone: 'Europe/Berlin',
						karma: 100,
					},
				},
			},
		},
		create: {
			clerkId: 'seed_user_1',
			username: 'alice',
			profile: {
				create: {
					about: 'Lighting TD and CGNews seed curator.',
					website: 'https://example.com/alice',
					discipline: 'Lighting',
					affiliationStatus: 'Studio artist',
					location: 'Berlin, DE',
					timezone: 'Europe/Berlin',
					karma: 100,
				},
			},
		},
	})

	const featuredAt = new Date()
	const stories = [
		{
			title: 'OpenPBR 1.1 production notes from a hard-surface lookdev pass',
			url: 'https://example.com/openpbr-lookdev-notes',
			text: null,
			type: 'LINK',
			score: 42,
			descendants: 11,
			isSelfPromo: false,
			curatorNote: 'Good practical notes for shader authors and lookdev artists.',
			featuredAt,
			curatorId: user.id,
		},
		{
			title: 'Ask CGNews: How are small teams versioning Houdini caches?',
			url: null,
			text: 'We are trying to keep farm outputs reproducible without turning every sim cache into permanent storage. What naming and retention rules have held up for you?',
			type: 'ASK',
			score: 18,
			descendants: 9,
			isSelfPromo: false,
		},
		{
			title: 'Show CGNews: A tiny USD scene diff viewer for shot reviews',
			url: 'https://example.com/usd-scene-diff',
			text: null,
			type: 'SHOW',
			score: 31,
			descendants: 6,
			isSelfPromo: true,
			commercialDisclosure: 'Personal open-source project by the submitter.',
		},
		{
			title: 'Pipeline TD for procedural environment tools',
			url: 'https://example.com/jobs/pipeline-td-environments',
			text: 'Remote-friendly role building Houdini and USD tooling for a mid-sized VFX team.',
			type: 'JOB',
			score: 12,
			descendants: 3,
			isSelfPromo: true,
			commercialDisclosure: 'Posted by the hiring studio.',
		},
	]

	for (const s of stories) {
		await prisma.story.create({
			data: {
				title: s.title,
				url: s.url,
				text: s.text,
				type: s.type,
				score: s.score,
				descendants: s.descendants,
				isSelfPromo: s.isSelfPromo,
				commercialDisclosure: s.commercialDisclosure,
				curatorNote: s.curatorNote,
				featuredAt: s.featuredAt,
				curator: s.curatorId ? { connect: { id: s.curatorId } } : undefined,
				author: { connect: { id: user.id } },
			},
		})
	}

	console.log('Seed completed: 1 user,', stories.length, 'stories')
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
