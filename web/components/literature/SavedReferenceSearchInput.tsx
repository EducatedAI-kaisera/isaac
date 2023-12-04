import { Input } from '@components/ui/input';
import { Search } from 'lucide-react';
import React from 'react';

const SavedReferenceSearchInput = () => {
	return (
		<div className="flex items-center flex-wrap gap-2 mb-2 relative px-3">
			<Input
				// onChange={e => setRefSearchInput(e.target.value)}
				placeholder="Search your references..."
				className="bg-white dark:bg-inherit"
			/>
			<button className="absolute right-4" type="submit">
				<Search className="w-6 h-4" strokeWidth={1.4} />
			</button>
		</div>
	);
};

export default SavedReferenceSearchInput;
